const asyncHandler = require("express-async-handler");
const Stadium = require("../models/stadiumModel");
const Tournament = require("../models/tournamentModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const Team = require("../models/teamModel");
const { chat } = require("../services/aiService");

/**
 * Natural-language stadium search.
 * Input:  { query: "turf in luanda under 50k for 10+ players for sunday evening" }
 * Flow:
 *   1. Ask the AI to convert the query into a structured filter (JSON schema we control).
 *   2. Validate/sanitize the filter — never trust AI output as raw Mongo query.
 *   3. Build a safe MongoDB query from the validated filter.
 *   4. Return matching stadiums + the parsed filter (for transparency/debug).
 */

const SYSTEM_PROMPT = `You convert natural-language stadium search queries into a structured JSON filter.

Return ONLY valid JSON matching this schema — no prose, no code fences:
{
  "location": string | null,           // city or neighborhood, lowercase (e.g. "luanda", "beirut", "tripoli")
  "priceMax": number | null,           // max price per match, in the local currency
  "priceMin": number | null,
  "minPlayers": number | null,         // minimum stadium player capacity the user needs
  "openAt": string | null,             // time in 24h "HH:MM" the user wants the stadium to be open at
  "dayOfWeek": string | null           // "monday".."sunday" or null
}

Rules:
- If a field is not mentioned, use null. Do not invent values.
- For shorthand like "50k", "100k" convert: 50k=50000, 100k=100000, 1.5m=1500000.
- "evening" => "19:00", "night" => "21:00", "morning" => "09:00", "afternoon" => "15:00", "noon" => "12:00".
- Lowercase all strings.
- Output MUST be parseable JSON and nothing else.`;

function parseAiJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }
  // Strip code fences the model might add despite instructions.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract the first {...} block in case model wrapped JSON in prose.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`AI returned non-JSON: ${cleaned.slice(0, 200)}`);
  }
}

const TIME_KEYWORDS = {
  morning: "09:00",
  noon: "12:00",
  afternoon: "15:00",
  evening: "19:00",
  night: "21:00",
};

function normalizeOpenAt(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (/^\d{2}:\d{2}$/.test(v)) return v;
  return TIME_KEYWORDS[v] || null;
}

function buildMongoQuery(parsed) {
  const q = {};

  if (typeof parsed.location === "string" && parsed.location.trim()) {
    q.location = { $regex: parsed.location.trim(), $options: "i" };
  }

  const priceFilter = {};
  if (typeof parsed.priceMin === "number" && parsed.priceMin > 0) priceFilter.$gte = parsed.priceMin;
  if (typeof parsed.priceMax === "number" && parsed.priceMax > 0) priceFilter.$lte = parsed.priceMax;
  if (Object.keys(priceFilter).length) q.pricePerMatch = priceFilter;

  if (typeof parsed.minPlayers === "number" && parsed.minPlayers > 0) {
    q.maxPlayers = { $gte: parsed.minPlayers };
  }

  // Time-window filter: stadium's workingHours.start <= openAt < workingHours.end (string compare works for "HH:MM")
  const openAt = normalizeOpenAt(parsed.openAt);
  if (openAt) {
    q["workingHours.start"] = { $lte: openAt };
    // Note: some stadiums close at "00:00" meaning midnight — we don't filter end strictly to avoid excluding them.
  }

  return q;
}

exports.searchStadiums = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query (string) is required" });
  }

  let raw = "";
  let parsed = null;
  try {
    raw = await chat(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query.trim() },
      ],
      { json: true, maxTokens: 200, temperature: 0 }
    );
    parsed = parseAiJson(raw);
  } catch (err) {
    return res.status(502).json({
      error: "AI parsing failed",
      detail: err.message,
      raw,
    });
  }

  const mongoQuery = buildMongoQuery(parsed);
  const stadiums = await Stadium.find(mongoQuery)
    .populate("ownerId", "username email")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: stadiums.length,
    parsed,
    query: mongoQuery,
    data: stadiums,
  });
});

/**
 * Generate a polished description for a stadium or academy.
 * Input:  { type: "stadium"|"academy", name, location, pricePerMatch?, maxPlayers?, workingHours?, amenities?, highlights? }
 * Output: { description: string }
 */
exports.generateDescription = asyncHandler(async (req, res) => {
  const { type, name, location } = req.body;
  if (!["stadium", "academy"].includes(type)) {
    return res.status(400).json({ error: 'type must be "stadium" or "academy"' });
  }
  if (!name || !location) {
    return res.status(400).json({ error: "name and location are required" });
  }

  const facts = Object.entries(req.body)
    .filter(([k, v]) => k !== "type" && v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `- ${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join("\n");

  const description = await chat(
    [
      {
        role: "system",
        content: `You write concise, persuasive marketing descriptions for ${type}s listed on a sports-booking platform.
Rules:
- 2-4 short sentences. No markdown, no bullet points, no emojis.
- Mention the location naturally. Highlight the strongest 1-2 facts provided.
- Warm, inviting tone. Plain English. No clichés like "state-of-the-art" or "one-stop-shop".
- Never invent amenities not listed in the facts.`,
      },
      { role: "user", content: `Facts:\n${facts}\n\nWrite the description:` },
    ],
    { maxTokens: 300, temperature: 0.6 }
  );

  res.json({ success: true, description: description.trim() });
});

/**
 * Booking assistant chatbot. Answers questions about the platform's rules.
 * Input:  { messages: [{role: "user"|"assistant", content: string}] }
 * Output: { reply: string }
 */
const CHATBOT_SYSTEM = `You are the SportsHub support assistant. SportsHub is a football stadium & academy booking platform.

Scope rules:
- Only answer questions about: booking stadiums, cancellation, penalties, tournaments, teams, academies, user accounts.
- If asked anything else (weather, general chat, politics), briefly say you can only help with SportsHub and suggest they ask a booking-related question.
- Do not invent policies. If unsure about a specific number (exact refund %, exact fees), say the user should check the stadium's penalty policy on the stadium page.

Platform facts (always true):
- Users can book stadiums for a specific time slot. Each stadium has working hours.
- Each stadium owner sets their own penalty policy: "hoursBefore" (cancel cut-off in hours) and "penaltyAmount" (charged if they cancel inside the window).
- Cancelling BEFORE the penalty window = full refund. Cancelling INSIDE the window = penalty is charged.
- Tournaments are organized events. Teams join; teamLeaders create and manage teams.
- Roles: user, stadiumOwner, academyOwner, teamLeader, referee, admin.
- Wallet: users get a starting wallet balance for booking.
- Each user must verify email before full access.

Tone: friendly, concise (1-3 sentences usually). Plain English.`;

/**
 * Generate a single-elimination bracket with an AI-suggested schedule.
 * Input:  { tournamentId: string }  — tournament must exist and have >= 2 teams.
 * Output: { matches: [{ round, matchNumber, team1, team2, scheduledAt, stadium }], totalRounds, notes }
 *
 * Pairing is algorithmic (random shuffle) for reliability. AI is used only to
 * distribute match dates across the tournament window and write brief notes.
 */
exports.generateBracket = asyncHandler(async (req, res) => {
  const { tournamentId } = req.body;
  if (!tournamentId) return res.status(400).json({ error: "tournamentId is required" });

  const tournament = await Tournament.findById(tournamentId)
    .populate("teams", "name")
    .populate("stadiumId", "name location workingHours");

  if (!tournament) return res.status(404).json({ error: "Tournament not found" });

  const teams = tournament.teams || [];
  if (teams.length < 2) {
    return res.status(400).json({ error: "Tournament needs at least 2 teams to generate a bracket" });
  }

  // Round up to next power of 2, assign byes if needed.
  const nextPowerOf2 = (n) => Math.pow(2, Math.ceil(Math.log2(n)));
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const slots = nextPowerOf2(shuffled.length);
  const byes = slots - shuffled.length;
  const paddedTeams = [...shuffled, ...Array(byes).fill(null)];

  // Build first-round matches; later rounds have TBD opponents.
  const firstRound = [];
  for (let i = 0; i < paddedTeams.length; i += 2) {
    firstRound.push({
      round: 1,
      matchNumber: i / 2 + 1,
      team1: paddedTeams[i] ? { id: paddedTeams[i]._id.toString(), name: paddedTeams[i].name } : null,
      team2: paddedTeams[i + 1] ? { id: paddedTeams[i + 1]._id.toString(), name: paddedTeams[i + 1].name } : null,
      bye: !paddedTeams[i] || !paddedTeams[i + 1],
    });
  }
  const totalRounds = Math.log2(slots);

  // Ask AI to assign dates/times to each match across the tournament window.
  const aiPrompt = {
    start: tournament.startDate.toISOString().slice(0, 10),
    end: tournament.endDate.toISOString().slice(0, 10),
    workingHours: tournament.stadiumId?.workingHours || { start: "15:00", end: "22:00" },
    totalRounds,
    firstRoundMatches: firstRound.map((m) => ({
      round: m.round,
      matchNumber: m.matchNumber,
      team1: m.team1?.name || "BYE",
      team2: m.team2?.name || "BYE",
    })),
  };

  let schedule = [];
  let notes = "";
  try {
    const raw = await chat(
      [
        {
          role: "system",
          content: `You schedule tournament matches. Given the tournament window, working hours, and first-round matches, assign each match a date (YYYY-MM-DD) and time (HH:MM) within the window and working hours.

Rules:
- Spread matches across multiple days if possible (avoid cramming everything on day 1).
- Each match is 90 minutes. Leave at least 30 minutes between back-to-back matches.
- Round 1 must complete before round 2 starts; round 2 before round 3; etc.
- Skip matches marked as "BYE" — they don't need a time.
- Return ONLY valid JSON: {"schedule": [{"matchNumber": number, "scheduledAt": "YYYY-MM-DDTHH:MM"}], "notes": string}`,
        },
        { role: "user", content: JSON.stringify(aiPrompt) },
      ],
      { json: true, maxTokens: 600, temperature: 0.2 }
    );
    const parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
    schedule = Array.isArray(parsed.schedule) ? parsed.schedule : [];
    notes = typeof parsed.notes === "string" ? parsed.notes : "";
  } catch (err) {
    // AI scheduling failed — fall back to all matches on tournament start date, 2-hour slots.
    const start = new Date(tournament.startDate);
    schedule = firstRound
      .filter((m) => !m.bye)
      .map((m, i) => {
        const when = new Date(start);
        when.setHours(15 + (i * 2), 0, 0, 0);
        return { matchNumber: m.matchNumber, scheduledAt: when.toISOString().slice(0, 16) };
      });
    notes = `AI scheduler unavailable (${err.message}); used default 2-hour slots from start date.`;
  }

  // Merge schedule into matches.
  const scheduleMap = new Map(schedule.map((s) => [s.matchNumber, s.scheduledAt]));
  const matches = firstRound.map((m) => ({
    ...m,
    scheduledAt: m.bye ? null : scheduleMap.get(m.matchNumber) || null,
    stadium: tournament.stadiumId
      ? { id: tournament.stadiumId._id.toString(), name: tournament.stadiumId.name }
      : null,
  }));

  res.json({
    success: true,
    tournament: { id: tournament._id.toString(), name: tournament.name },
    totalRounds,
    totalTeams: teams.length,
    byes,
    matches,
    notes,
  });
});

exports.chatbot = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }
  const clean = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .slice(-10) // keep only recent turns to bound cost
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.trim().slice(0, 1000), // bound each message length
    }));
  if (!clean.length) {
    return res.status(400).json({ error: "no valid messages" });
  }

  const reply = await chat(
    [{ role: "system", content: CHATBOT_SYSTEM }, ...clean],
    { maxTokens: 300, temperature: 0.4 }
  );

  res.json({ success: true, reply: reply.trim() });
});

/**
 * Summarize what reviewers loved and complained about for a stadium.
 * Input:  POST /api/ai/review-summary/:stadiumId
 * Output: { averageRating, count, pros: string[], cons: string[], summary: string }
 *
 * The endpoint pulls the latest ~50 reviews, aggregates ratings, and asks the AI
 * to extract common pros/cons. Cheap (single call), cacheable at the caller.
 */
exports.reviewSummary = asyncHandler(async (req, res) => {
  const { stadiumId } = req.params;
  const reviews = await Review.find({ stadium: stadiumId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("rating comment")
    .lean();

  if (reviews.length === 0) {
    return res.json({
      success: true,
      count: 0,
      averageRating: 0,
      pros: [],
      cons: [],
      summary: "No reviews yet.",
    });
  }

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // If too few reviews, skip AI — not enough signal.
  if (reviews.length < 3) {
    return res.json({
      success: true,
      count: reviews.length,
      averageRating: Number(averageRating.toFixed(2)),
      pros: [],
      cons: [],
      summary: "Not enough reviews yet to summarize.",
    });
  }

  const corpus = reviews
    .map((r, i) => `${i + 1}. [${r.rating}/5] ${r.comment.slice(0, 300)}`)
    .join("\n");

  let pros = [];
  let cons = [];
  let summary = "";
  try {
    const raw = await chat(
      [
        {
          role: "system",
          content: `Summarize stadium reviews. Return ONLY JSON:
{"pros": [up to 4 short phrases], "cons": [up to 4 short phrases], "summary": "one-sentence overall vibe"}

Rules:
- Each pro/con: max 6 words. Plain English. No emojis.
- Base it only on what reviewers actually say. Do not invent.
- If reviews are mostly positive but mention small complaints, still surface the top 1-2 cons.`,
        },
        { role: "user", content: corpus },
      ],
      { json: true, maxTokens: 400, temperature: 0.3 }
    );
    const parsed = JSON.parse(
      raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    );
    pros = Array.isArray(parsed.pros) ? parsed.pros.slice(0, 4) : [];
    cons = Array.isArray(parsed.cons) ? parsed.cons.slice(0, 4) : [];
    summary = typeof parsed.summary === "string" ? parsed.summary : "";
  } catch (err) {
    return res.status(502).json({
      error: "AI review summary failed",
      detail: err.message,
    });
  }

  res.json({
    success: true,
    count: reviews.length,
    averageRating: Number(averageRating.toFixed(2)),
    pros,
    cons,
    summary,
  });
});

/**
 * Suggest complementary team members based on existing roster + skill profile.
 * Input:  POST /api/ai/suggest-team-members  { teamId }
 * Output: { missingPositions, suggestions: [{user, reason}] }
 *
 * Flow:
 *   1. Load the team and its members (with skills).
 *   2. Compute what positions are missing (balanced team: 1 GK, 2 DEF, 2 MID, 2 FWD ideal).
 *   3. Pull candidates: users WITHOUT a team + with a non-null position.
 *   4. Ask AI to pick up to 5 and explain why each fits.
 *   5. Return the picks — caller (team leader) decides who to invite.
 */
const POSITION_TARGETS = { goalkeeper: 1, defender: 2, midfielder: 2, forward: 2 };

exports.suggestTeamMembers = asyncHandler(async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ error: "teamId is required" });

  const team = await Team.findById(teamId).populate("members", "username skills");
  if (!team) return res.status(404).json({ error: "Team not found" });

  // Count current positions.
  const currentCounts = { goalkeeper: 0, defender: 0, midfielder: 0, forward: 0 };
  for (const m of team.members || []) {
    const pos = m?.skills?.position;
    if (pos && currentCounts[pos] !== undefined) currentCounts[pos]++;
  }

  // What's missing relative to a balanced target.
  const missingPositions = Object.entries(POSITION_TARGETS)
    .filter(([pos, target]) => currentCounts[pos] < target)
    .map(([pos, target]) => ({
      position: pos,
      needed: target - currentCounts[pos],
    }));

  // Pull up to 40 candidate users: no team, known position, skillLevel set.
  const candidates = await User.find({
    team: { $in: [null, undefined] },
    "skills.position": { $nin: [null, undefined, ""] },
    _id: { $ne: req.user.id },
  })
    .select("_id username skills")
    .limit(40)
    .lean();

  if (candidates.length === 0) {
    return res.json({
      success: true,
      team: { id: team._id.toString(), name: team.name },
      missingPositions,
      suggestions: [],
      notes: "No free players with filled skill profiles found.",
    });
  }

  // Ask AI to pick up to 5 and briefly justify each.
  const aiInput = {
    team: {
      name: team.name,
      currentCounts,
      missingPositions,
    },
    candidates: candidates.map((c) => ({
      id: c._id.toString(),
      username: c.username,
      position: c.skills?.position,
      skillLevel: c.skills?.skillLevel,
      preferredFoot: c.skills?.preferredFoot,
      bio: (c.skills?.bio || "").slice(0, 120),
    })),
  };

  let suggestions = [];
  let notes = "";
  try {
    const raw = await chat(
      [
        {
          role: "system",
          content: `You pick up to 5 team members that best complement a football team's existing roster.

Return ONLY JSON:
{"suggestions": [{"userId": "<id from candidates>", "reason": "<under 15 words why this fits>"}], "notes": "<optional overall note under 25 words>"}

Priorities:
1. Fill the missing positions first (e.g. goalkeeper if the team has none).
2. Prefer higher skillLevel within a needed position.
3. Prefer preferredFoot balance for defenders/forwards if relevant.
4. Never pick someone not in the candidates list. Use exact ids.`,
        },
        { role: "user", content: JSON.stringify(aiInput) },
      ],
      { json: true, maxTokens: 600, temperature: 0.2 }
    );
    const parsed = JSON.parse(
      raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    );
    const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));
    suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .slice(0, 5)
      .map((s) => {
        const c = candidateMap.get(s.userId);
        if (!c) return null;
        return {
          user: {
            id: c._id.toString(),
            username: c.username,
            position: c.skills?.position,
            skillLevel: c.skills?.skillLevel,
            preferredFoot: c.skills?.preferredFoot,
          },
          reason: typeof s.reason === "string" ? s.reason : "",
        };
      })
      .filter(Boolean);
    notes = typeof parsed.notes === "string" ? parsed.notes : "";
  } catch (err) {
    // Fallback: algorithmic pick — highest skillLevel within missing positions.
    const byPos = {};
    for (const c of candidates) {
      const p = c.skills?.position;
      if (!p) continue;
      (byPos[p] ||= []).push(c);
    }
    for (const group of Object.values(byPos)) {
      group.sort((a, b) => (b.skills?.skillLevel || 0) - (a.skills?.skillLevel || 0));
    }
    const picks = [];
    for (const { position, needed } of missingPositions) {
      for (const c of (byPos[position] || []).slice(0, needed)) {
        picks.push({
          user: {
            id: c._id.toString(),
            username: c.username,
            position: c.skills?.position,
            skillLevel: c.skills?.skillLevel,
            preferredFoot: c.skills?.preferredFoot,
          },
          reason: `Strong ${position} (level ${c.skills?.skillLevel || "?"})`,
        });
        if (picks.length >= 5) break;
      }
      if (picks.length >= 5) break;
    }
    suggestions = picks;
    notes = `AI ranking unavailable (${err.message}); used skill-level ranking instead.`;
  }

  res.json({
    success: true,
    team: { id: team._id.toString(), name: team.name },
    missingPositions,
    suggestions,
    notes,
  });
});
