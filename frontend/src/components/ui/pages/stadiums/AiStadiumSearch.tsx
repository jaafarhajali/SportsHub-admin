"use client";
import React, { useState } from "react";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { aiSearchStadiums, AiStadiumFilter } from "@/lib/api/ai";
import { Stadium } from "@/types/Stadium";
import StadiumCard from "./StadiumCard";
import { toast } from "react-toastify";

const EXAMPLES = [
  "turf stadium in luanda under 50k for 10+ players",
  "cheapest stadium open in the evening",
  "big stadium for at least 20 players in tripoli",
  "stadium available sunday morning under 100k",
];

export default function AiStadiumSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Stadium[] | null>(null);
  const [parsed, setParsed] = useState<AiStadiumFilter | null>(null);

  const run = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    setParsed(null);
    try {
      const res = await aiSearchStadiums<Stadium>(q);
      setResults(res.data);
      setParsed(res.parsed);
      if (res.count === 0) {
        toast.info("No stadiums matched — try a different query.");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { detail?: string; error?: string } } }).response?.data
              ?.detail ||
            (err as { response?: { data?: { error?: string } } }).response?.data?.error)
          : undefined;
      toast.error(message || "AI search failed. Make sure the API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" /> AI-powered search
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Describe the stadium you want
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Use plain English — price, players, city, time of day. We'll find matches.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. turf in luanda under 50k for 10+ players on sunday evening"
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Thinking..." : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                run(ex);
              }}
              disabled={loading}
              className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-stone-700 transition disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>

        {parsed && (
          <div className="mb-6 p-4 rounded-lg bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 text-sm">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interpreted as:
            </div>
            <div className="flex flex-wrap gap-2">
              {parsed.location && (
                <Chip label="Location" value={parsed.location} />
              )}
              {parsed.priceMax != null && (
                <Chip label="Max price" value={parsed.priceMax.toLocaleString()} />
              )}
              {parsed.priceMin != null && (
                <Chip label="Min price" value={parsed.priceMin.toLocaleString()} />
              )}
              {parsed.minPlayers != null && (
                <Chip label="Min players" value={String(parsed.minPlayers)} />
              )}
              {parsed.openAt && <Chip label="Open at" value={parsed.openAt} />}
              {parsed.dayOfWeek && <Chip label="Day" value={parsed.dayOfWeek} />}
              {!parsed.location &&
                parsed.priceMax == null &&
                parsed.priceMin == null &&
                parsed.minPlayers == null &&
                !parsed.openAt &&
                !parsed.dayOfWeek && (
                  <span className="text-gray-500">No specific filters detected — showing everything.</span>
                )}
            </div>
          </div>
        )}

        {results && (
          <>
            <div className="mb-4 text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold text-gray-900 dark:text-white">{results.length}</span>{" "}
              stadium{results.length === 1 ? "" : "s"}
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {results.map((s) => (
                <StadiumCard
                  key={s._id}
                  id={s._id}
                  name={s.name}
                  location={s.location}
                  pricePerMatch={s.pricePerMatch}
                  image={s.photos?.[0]}
                  workingHours={s.workingHours}
                  maxPlayers={s.maxPlayers}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
      {label}: {value}
    </span>
  );
}
