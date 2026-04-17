"use client";
import React, { useEffect, useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Star, Loader2 } from "lucide-react";
import { aiReviewSummary, ReviewSummary as ReviewSummaryType } from "@/lib/api/ai";

interface Props {
  stadiumId: string;
}

export default function ReviewSummary({ stadiumId }: Props) {
  const [data, setData] = useState<ReviewSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    aiReviewSummary(stadiumId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stadiumId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-sm text-gray-500">Analyzing reviews...</span>
      </div>
    );
  }

  if (error || !data) return null;

  if (data.count === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6 text-center text-sm text-gray-500">
        No reviews yet. Be the first to leave one!
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          AI review summary
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`w-5 h-5 ${
                n <= Math.round(data.averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.averageRating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          based on {data.count} review{data.count === 1 ? "" : "s"}
        </span>
      </div>

      {data.summary && (
        <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-4 border-l-2 border-blue-400 pl-3">
          {data.summary}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data.pros.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                What people love
              </span>
            </div>
            <ul className="space-y-1.5">
              {data.pros.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-5 relative">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.cons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                Common complaints
              </span>
            </div>
            <ul className="space-y-1.5">
              {data.cons.map((c, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-5 relative">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
