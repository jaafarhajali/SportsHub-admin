"use client";
import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { aiGenerateDescription, DescriptionType } from "@/lib/api/ai";
import { toast } from "react-toastify";

interface Props {
  type: DescriptionType;
  fields: Record<string, unknown>;
  onGenerated: (description: string) => void;
  disabled?: boolean;
}

export default function AiDescriptionButton({ type, fields, onGenerated, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (loading) return;
    if (!fields.name || !fields.location) {
      toast.warning("Fill name and location first");
      return;
    }
    setLoading(true);
    try {
      const desc = await aiGenerateDescription(type, fields);
      onGenerated(desc);
      toast.success("Description generated");
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading || disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-60 transition"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {loading ? "Writing..." : "Generate with AI"}
    </button>
  );
}
