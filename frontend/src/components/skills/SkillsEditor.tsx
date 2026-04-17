"use client";
import React, { useEffect, useState } from "react";
import { Loader2, Save, UserCircle2 } from "lucide-react";
import { getMySkills, updateMySkills } from "@/lib/api/skills";
import { PlayerSkills } from "@/lib/api/ai";
import { toast } from "react-toastify";

const POSITIONS: Array<{ value: NonNullable<PlayerSkills["position"]>; label: string }> = [
  { value: "goalkeeper", label: "Goalkeeper" },
  { value: "defender", label: "Defender" },
  { value: "midfielder", label: "Midfielder" },
  { value: "forward", label: "Forward" },
];

const FEET: Array<{ value: NonNullable<PlayerSkills["preferredFoot"]>; label: string }> = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
];

export default function SkillsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<PlayerSkills>({
    position: null,
    skillLevel: null,
    preferredFoot: null,
    bio: "",
  });

  useEffect(() => {
    getMySkills()
      .then((s) => setSkills({ ...skills, ...s }))
      .catch(() => toast.error("Failed to load your skills"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMySkills(skills);
      setSkills({ ...skills, ...updated });
      toast.success("Skills saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 p-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your skills...
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-xl p-6 space-y-5 max-w-2xl"
    >
      <div className="flex items-center gap-3 mb-2">
        <UserCircle2 className="w-6 h-6 text-blue-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your player profile</h2>
          <p className="text-sm text-gray-500">
            Used by team leaders to find complementary players. Fill in what you play.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Position
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setSkills({ ...skills, position: p.value })}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                skills.position === p.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-stone-700 hover:border-blue-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Skill level (1–10)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            value={skills.skillLevel ?? 5}
            onChange={(e) => setSkills({ ...skills, skillLevel: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-center font-semibold text-blue-600">
            {skills.skillLevel ?? "—"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preferred foot
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FEET.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSkills({ ...skills, preferredFoot: f.value })}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                skills.preferredFoot === f.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-stone-700 hover:border-blue-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Short bio (optional)
        </label>
        <textarea
          value={skills.bio || ""}
          onChange={(e) => setSkills({ ...skills, bio: e.target.value.slice(0, 300) })}
          rows={3}
          placeholder="Tell team leaders about your strengths..."
          className="w-full rounded-lg border border-gray-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm p-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">{(skills.bio || "").length}/300</div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : "Save skills"}
      </button>
    </form>
  );
}
