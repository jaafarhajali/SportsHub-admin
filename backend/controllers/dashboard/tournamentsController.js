const asyncHandler = require("express-async-handler");
const Tournament = require("../../models/tournamentModel");
const Team = require("../../models/teamModel");
const User = require("../../models/userModel");
const Stadium = require("../../models/stadiumModel");
const Notification = require("../../models/notificationModel");

// Get all tournaments
exports.getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find()
    .populate("createdBy", "username")
    .populate("stadiumId", "name")
    .populate("teams", "name");

  res.status(200).json({
    status: "success",
    data: tournaments,
  });
});

// Get my tournaments
exports.getMyTournaments = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const tournaments = await Tournament.find({ createdBy: ownerId })
    .populate("createdBy", "username")
    .populate("stadiumId", "name")
    .populate("teams", "name");

  res.status(200).json({
    status: "success",
    data: tournaments,
  });
});

// Create new tournament
exports.addTournament = asyncHandler(async (req, res) => {
  const { name, description, entryPricePerTeam, rewardPrize, maxTeams, startDate, endDate, stadiumId } = req.body;

  // ✅ Validate dates
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start < now) {
    return res.status(400).json({ error: "Start date cannot be before today." });
  }

  if (end < now) {
    return res.status(400).json({ error: "End date cannot be before today." });
  }

  if (end < start) {
    return res.status(400).json({ error: "End date cannot be before the start date." });
  }

  // ✅ Get stadium to extract owner
  const stadium = await Stadium.findById(stadiumId);
  if (!stadium) {
    return res.status(404).json({ error: "Stadium not found." });
  }

  const ownerId = stadium.ownerId; // make sure Stadium model includes `owner`

  // ✅ Create tournament with owner
  let newTournament = await Tournament.create({
    name,
    description,
    entryPricePerTeam,
    rewardPrize,
    maxTeams,
    startDate,
    endDate,
    stadiumId,
    createdBy: req.user.id, // admin or stadium owner
    updatedBy: req.user.id,
    owner: ownerId, // stadium's actual owner
  });

  // ✅ Populate stadium and owner
  newTournament = await Tournament.findById(newTournament._id)
    .populate("stadiumId", "name")
    .populate("owner", "username");

  // ✅ Notify all users
  const users = await User.find({}, "_id");
  const notifications = await Promise.all(
    users.map((user) =>
      Notification.create({
        user: user._id,
        message: `A new tournament "${newTournament.name}" has been added.`,
        type: "tournament-added",
        metadata: {
          tournamentId: newTournament._id,
        },
      })
    )
  );

  await Promise.all(
    notifications.map((notification) =>
      User.findByIdAndUpdate(notification.user, {
        $push: { notifications: notification._id },
      })
    )
  );

  // ✅ Return success response
  res.status(201).json({
    status: "success",
    data: newTournament,
  });
});

// Update a tournament
exports.updateTournament = asyncHandler(async (req, res) => {
  const { name, description, entryPricePerTeam, rewardPrize, maxTeams, startDate, endDate, stadiumId } = req.body;

  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  tournament.name = name ?? tournament.name;
  tournament.description = description ?? tournament.description;
  tournament.entryPricePerTeam = entryPricePerTeam ?? tournament.entryPricePerTeam;
  tournament.rewardPrize = rewardPrize ?? tournament.rewardPrize;
  tournament.maxTeams = maxTeams ?? tournament.maxTeams;
  tournament.startDate = startDate ?? tournament.startDate;
  tournament.endDate = endDate ?? tournament.endDate;
  tournament.stadiumId = stadiumId ?? tournament.stadiumId;
  tournament.updatedBy = req.user.id;
  tournament.updatedAt = Date.now();

  const updatedTournament = await tournament.save();

  res.status(200).json({
    status: "success",
    message: "Tournament updated",
    data: updatedTournament,
  });
});

// Delete a tournament
exports.deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  await tournament.deleteOne();

  // Notify all users about deleted tournament
  const users = await User.find({}, "_id");
  const notifications = await Promise.all(
    users.map((user) =>
      Notification.create({
        user: user._id,
        message: `The tournament "${tournament.name}" has been deleted.`,
        type: "info",
        metadata: {
          tournamentId: tournament._id,
        },
      })
    )
  );

  // Push notifications to users
  await Promise.all(
    notifications.map((notification) =>
      User.findByIdAndUpdate(notification.user, {
        $push: { notifications: notification._id },
      })
    )
  );

  res.status(200).json({
    status: "success",
    message: "Tournament deleted",
  });
});

exports.addTeamToTournament = asyncHandler(async (req, res) => {
  const { tournamentId, teamId } = req.body;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  if (tournament.teams.includes(teamId)) {
    return res.status(400).json({ message: "Team already joined" });
  }

  if (tournament.teams.length >= tournament.maxTeams) {
    return res.status(400).json({ message: "Max teams limit reached" });
  }

  tournament.teams.push(teamId);
  tournament.updatedBy = req.user.id;
  tournament.updatedAt = Date.now();

  await tournament.save();

  // Notify team members
  const team = await Team.findById(teamId).populate("members", "_id username");
  if (team && team.members.length > 0) {
    const message = `Your team "${team.name}" has been added to the tournament "${tournament.name}" by an admin.`;

    const notifications = await Promise.all(
      team.members.map((member) =>
        Notification.create({
          user: member._id,
          message,
          type: "info",
          metadata: { teamId, tournamentId },
        })
      )
    );

    await Promise.all(
      team.members.map((member, i) =>
        User.findByIdAndUpdate(member._id, {
          $push: { notifications: notifications[i]._id },
        })
      )
    );
  }

  res.status(200).json({ message: "Team added to tournament" });
});

exports.removeTeamFromTournament = asyncHandler(async (req, res) => {
  const { tournamentId, teamId } = req.body;

  const [tournament, team] = await Promise.all([Tournament.findById(tournamentId), Team.findById(teamId)]);

  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  if (!team) return res.status(404).json({ message: "Team not found" });

  if (!tournament.teams.includes(teamId)) return res.status(400).json({ message: "Team not in tournament" });

  /* ---------- REFUND SECTION ---------- */
  const paidIndex = team.paidTournaments.findIndex((id) => id.toString() === tournamentId);

  if (paidIndex !== -1) {
    const leader = await User.findById(team.leader);
    const tournamentMgr = await User.findById(tournament.owner); // or owner

    leader.wallet += tournament.entryPricePerTeam;
    tournamentMgr.wallet -= tournament.entryPricePerTeam;

    await Promise.all([leader.save({ validateBeforeSave: false }), tournamentMgr.save({ validateBeforeSave: false })]);

    // remove this tournament from the paid list
    team.paidTournaments.splice(paidIndex, 1);
    await team.save();
  }
  /* ------------------------------------- */

  // finally, remove the team from the tournament
  tournament.teams = tournament.teams.filter((id) => id.toString() !== teamId);
  tournament.updatedBy = req.user.id;
  tournament.updatedAt = Date.now();
  await tournament.save();

  // ---------- NOTIFY ----------
  if (team && team.members.length > 0) {
    const message = `Your team "${team.name}" has been removed from the tournament "${tournament.name}" by an admin.`;

    const notifications = await Promise.all(
      team.members.map((member) =>
        Notification.create({
          user: member._id,
          message,
          type: "info",
          metadata: { teamId, tournamentId },
        })
      )
    );

    await Promise.all(
      team.members.map((member, i) =>
        User.findByIdAndUpdate(member._id, {
          $push: { notifications: notifications[i]._id },
        })
      )
    );
  }

  res.status(200).json({ message: "Team removed and refunded (if applicable)" });
});

exports.getTournamentTeams = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate({
    path: "teams",
    select: "_id name leader",
    populate: { path: "leader", select: "username" }, // optional
  });

  if (!tournament) return res.status(404).json({ status: "fail", message: "Tournament not found" });

  res.status(200).json({
    status: "success",
    results: tournament.teams.length,
    data: tournament.teams,
  });
});
