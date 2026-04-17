"use client";
import React, { useState } from "react";
import { Sparkles, Loader2, Trophy, Calendar, MapPin } from "lucide-react";
import { aiGenerateBracket, BracketResult, BracketMatch } from "@/lib/api/ai";
import { toast } from "react-toastify";

interface Props {
  tournamentId: string;
  tournamentName?: string;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TournamentBracket({ tournamentId, tournamentName }: Props) {
  const [loading, setLoading] = useState(false);
  const [bracket, setBracket] = useState<BracketResult | null>(null);

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await aiGenerateBracket(tournamentId);
      setBracket(res);
      toast.success("Bracket generated");
    } catch (err: unknown) {
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error)
          : undefined;
      toast.error(detail || "Failed to generate bracket");
    } finally {
      setLoading(false);
    }
  };

  const matchesByRound: Record<number, BracketMatch[]> = {};
  bracket?.matches.forEach((m) => {
    (matchesByRound[m.round] ||= []).push(m);
  });

  return (
    <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {tournamentName || "Tournament"} bracket
            </h3>
            <p className="text-sm text-gray-500">
              AI pairs teams and schedules matches across the tournament window.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium disabled:opacity-60 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating..." : bracket ? "Regenerate" : "Generate bracket"}
        </button>
      </div>

      {bracket && (
        <>
          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            <Stat label="Teams" value={bracket.totalTeams} />
            <Stat label="Rounds" value={bracket.totalRounds} />
            {bracket.byes > 0 && <Stat label="Byes" value={bracket.byes} />}
          </div>

          {bracket.notes && (
            <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 text-sm">
              {bracket.notes}
            </div>
          )}

          <div className="space-y-6">
            {Object.keys(matchesByRound)
              .map(Number)
              .sort((a, b) => a - b)
              .map((round) => (
                <div key={round}>
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Round {round}
                  </div>
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {matchesByRound[round].map((m) => (
                      <div
                        key={m.matchNumber}
                        className={`p-3 rounded-lg border ${
                          m.bye
                            ? "bg-gray-50 dark:bg-stone-800 border-gray-200 dark:border-stone-700 opacity-60"
                            : "bg-white dark:bg-stone-800 border-gray-200 dark:border-stone-700"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">Match #{m.matchNumber}</div>
                        <div className="space-y-1">
                          <TeamRow name={m.team1?.name} />
                          <div className="text-center text-xs text-gray-400 my-0.5">vs</div>
                          <TeamRow name={m.team2?.name} />
                        </div>
                        {!m.bye && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-stone-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(m.scheduledAt)}
                            </div>
                            {m.stadium && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {m.stadium.name}
                              </div>
                            )}
                          </div>
                        )}
                        {m.bye && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            Bye — one team advances automatically
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {!bracket && !loading && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Click <span className="font-medium">Generate bracket</span> to pair teams and schedule matches.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-gray-300">
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>{" "}
      <span className="text-gray-500">{label}</span>
    </span>
  );
}

function TeamRow({ name }: { name?: string }) {
  return (
    <div className="px-2 py-1.5 rounded bg-gray-50 dark:bg-stone-900 text-sm text-gray-900 dark:text-gray-100 truncate">
      {name || <span className="text-gray-400 italic">BYE</span>}
    </div>
  );
}
