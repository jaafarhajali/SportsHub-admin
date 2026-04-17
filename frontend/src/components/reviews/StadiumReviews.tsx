"use client";
import React, { useEffect, useState } from "react";
import { Star, Loader2, Trash2, Send } from "lucide-react";
import {
  getStadiumReviews,
  createReview,
  deleteReview,
  Review,
} from "@/lib/api/reviews";
import { useUser } from "@/context/UserContext";
import { getImageUrl } from "@/lib/utils/imageUrl";
import Image from "next/image";
import { toast } from "react-toastify";

interface Props {
  stadiumId: string;
}

export default function StadiumReviews({ stadiumId }: Props) {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const myReview = reviews.find(
    (r) => user && r.user && r.user._id === user.id
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStadiumReviews(stadiumId);
      setReviews(data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [stadiumId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning("Write a comment before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await createReview(stadiumId, rating, comment.trim());
      toast.success("Review posted");
      setComment("");
      setRating(5);
      await load();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message || "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted");
      await load();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Reviews{reviews.length > 0 && <span className="text-gray-500 font-normal"> ({reviews.length})</span>}
      </h3>

      {user && !myReview && (
        <form onSubmit={submit} className="mb-6 pb-6 border-b border-gray-200 dark:border-stone-700">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Share what you liked or didn't..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{comment.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium transition"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Posting..." : "Post review"}
            </button>
          </div>
        </form>
      )}

      {user && myReview && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-stone-700 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Your review</div>
            <div className="flex gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    n <= myReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{myReview.comment}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(myReview._id)}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label="Delete my review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter((r) => !myReview || r._id !== myReview._id)
            .map((r) => (
              <div key={r._id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                  {r.user?.profilePhoto ? (
                    <Image
                      src={getImageUrl(r.user.profilePhoto)}
                      alt={r.user.username}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600">
                      {r.user?.username?.substring(0, 2).toUpperCase() || "??"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {r.user?.username || "Anonymous"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${
                            n <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{r.comment}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
