"use client";
import React, { useState } from "react";
import { Sparkles, Loader2, User as UserIcon } from "lucide-react";
import { aiSuggestTeamMembers, SuggestMembersResult } from "@/lib/api/ai";
import { toast } from "react-toastify";

interface Props {
  teamId: string;
  teamName?: string;
}

const POSITION_COLORS: Record<string, string> = {
  goalkeeper: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  defender: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  midfielder: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  forward: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function TeamSuggestions({ teamId, teamName }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestMembersResult | null>(null);

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await aiSuggestTeamMembers(teamId);
      setResult(res);
      if (res.suggestions.length === 0) {
        toast.info("No matching free players found.");
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(msg || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI player suggestions{teamName && ` for ${teamName}`}
          </h3>
          <p className="text-sm text-gray-500">
            We look at your current roster, find missing positions, and rank free players.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Thinking..." : result ? "Refresh" : "Get suggestions"}
        </button>
      </div>

      {result && (
        <>
          {result.missingPositions.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Missing from your roster
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingPositions.map((m) => (
                  <span
                    key={m.position}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      POSITION_COLORS[m.position] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {m.position} × {m.needed}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.notes && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 text-sm">
              {result.notes}
            </div>
          )}

          <div className="space-y-3">
            {result.suggestions.map((s) => (
              <div
                key={s.user.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {s.user.username}
                    </span>
                    {s.user.position && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          POSITION_COLORS[s.user.position] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.user.position}
                      </span>
                    )}
                    {s.user.skillLevel != null && (
                      <span className="text-xs text-gray-500">Lvl {s.user.skillLevel}</span>
                    )}
                    {s.user.preferredFoot && (
                      <span className="text-xs text-gray-500">{s.user.preferredFoot} foot</span>
                    )}
                  </div>
                  {s.reason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="text-center py-6 text-sm text-gray-500">
          Click <span className="font-medium">Get suggestions</span> to see recommended players.
        </div>
      )}
    </div>
  );
}
