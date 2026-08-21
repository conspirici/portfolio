"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";

interface AIToolbarProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

export function AIToolbar({ content, onContentChange }: AIToolbarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showPromptFor, setShowPromptFor] = useState<"draft" | "mermaid" | null>(null);

  const handleAction = async (action: string, endpoint: string, payload: any) => {
    setLoadingAction(action);
    setAiFeedback(null);
    try {
      const res = await fetchApi(`/admin/ai/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.response) {
        if (action === "draft" || action === "mermaid") {
          // Append generated content to the editor
          onContentChange(content + (content ? "\n\n" : "") + res.response);
          setShowPromptFor(null);
          setPrompt("");
        } else {
          // Display feedback (tone check)
          setAiFeedback(res.response);
        }
      }
    } catch (err) {
      console.error(err);
      setAiFeedback("AI action failed. Check console or API key.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-forest-800/30 border border-forest-800 p-4 mb-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-sage-white/70 mr-2">AI Tools:</span>
        <button
          type="button"
          onClick={() => setShowPromptFor(showPromptFor === "draft" ? null : "draft")}
          className="px-3 py-1.5 text-xs bg-forest-800 hover:bg-forest-700 text-white transition-colors"
        >
          Draft Assist
        </button>
        <button
          type="button"
          onClick={() => handleAction("tone", "tone-check", { content })}
          disabled={loadingAction === "tone" || !content}
          className="px-3 py-1.5 text-xs bg-forest-800 hover:bg-forest-700 text-white transition-colors disabled:opacity-50"
        >
          {loadingAction === "tone" ? "Checking..." : "Tone Check"}
        </button>
        <button
          type="button"
          onClick={() => setShowPromptFor(showPromptFor === "mermaid" ? null : "mermaid")}
          className="px-3 py-1.5 text-xs bg-forest-800 hover:bg-forest-700 text-white transition-colors"
        >
          Mermaid Assist
        </button>
      </div>

      {showPromptFor && (
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={showPromptFor === "draft" ? "Enter bullet points to expand..." : "Describe the diagram..."}
            className="flex-1 px-3 py-1.5 text-sm bg-black border border-forest-800 text-white focus:outline-none focus:border-white"
          />
          <button
            type="button"
            onClick={() => {
              if (showPromptFor === "draft") {
                handleAction("draft", "draft-assist", { notes: prompt });
              } else {
                handleAction("mermaid", "mermaid-assist", { description: prompt });
              }
            }}
            disabled={loadingAction !== null || !prompt}
            className="px-4 py-1.5 text-sm bg-teal-700 hover:bg-teal-600 text-white transition-colors disabled:opacity-50"
          >
            {loadingAction ? "Generating..." : "Generate"}
          </button>
        </div>
      )}

      {aiFeedback && (
        <div className="bg-black/50 border border-teal-900/50 p-4 text-sm text-sage-white/90 whitespace-pre-wrap">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-teal-400">AI Feedback</span>
            <button type="button" onClick={() => setAiFeedback(null)} className="text-sage-white/50 hover:text-white">✕</button>
          </div>
          {aiFeedback}
        </div>
      )}
    </div>
  );
}
