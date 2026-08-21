"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AdminPageLoader } from "@/components/admin/AdminLoader";
import { AIToolbar } from "@/components/admin/AIToolbar";

interface AboutContent {
  headline: string;
  portrait_url: string;
  tags: string[];
  body: string;
  closing_line?: string;
}

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchApi("/admin/about-content")
      .then(setData)
      .catch((err) => console.error("Failed to load about content", err));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await fetchApi("/admin/about-content", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Save failed", error);
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetchApi("/admin/upload", {
        method: "POST",
        body: formData,
      },); // isFormData handled internally by fetchApi
      
      if (res && res.url) {
        setData(prev => prev ? { ...prev, portrait_url: res.url } : null);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (!tagInput.trim() || !data) return;
    setData(prev => prev ? { ...prev, tags: [...prev.tags, tagInput.trim()] } : null);
    setTagInput("");
  };

  const removeTag = (index: number) => {
    if (!data) return;
    const newTags = [...data.tags];
    newTags.splice(index, 1);
    setData(prev => prev ? { ...prev, tags: newTags } : null);
  };

  if (!data) return <AdminPageLoader />;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display text-white">About Content</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-teal-700 hover:bg-teal-600 text-white px-6 py-2 font-mono uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8 bg-black/20 p-6 border border-white/5">
        
        {/* Portrait Upload */}
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Portrait Image
          </label>
          <div className="flex items-start gap-6">
            {data.portrait_url && (
              <img src={data.portrait_url} alt="Portrait" className="w-32 h-40 object-cover border border-white/10" />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="mb-2 text-sm text-sage-white/70 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-mono file:bg-white/10 file:text-white hover:file:bg-white/20"
              />
              {isUploading && <span className="text-sm text-teal-400 ml-3">Uploading...</span>}
              <p className="text-xs text-sage-white/40 mt-1">Upload a black and white portrait for the scrapbook layout.</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Headline
          </label>
          <input
            type="text"
            value={data.headline || ""}
            onChange={(e) => setData({ ...data, headline: e.target.value })}
            placeholder="e.g. Hi! I'm a..."
            className="w-full bg-black/40 border border-white/10 text-white px-4 py-2 focus:border-teal-500 focus:outline-none font-display text-lg"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Roles / Tags (Scattered in layout)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.tags.map((tag, i) => (
              <span key={i} className="bg-white/10 px-3 py-1 text-sm flex items-center gap-2 border border-white/5">
                {tag}
                <button onClick={() => removeTag(i)} className="text-sage-white/50 hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="e.g. Creator, Engineer..."
              className="bg-black/40 border border-white/10 text-white px-4 py-2 flex-1 focus:border-teal-500 focus:outline-none"
            />
            <button onClick={addTag} className="bg-white/10 hover:bg-white/20 px-4 py-2 font-mono text-sm uppercase">
              Add
            </button>
          </div>
        </div>

        {/* Closing Line */}
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Closing Line
          </label>
          <input
            type="text"
            value={data.closing_line || ""}
            onChange={(e) => setData({ ...data, closing_line: e.target.value })}
            placeholder="e.g. Living and working in NYC"
            className="w-full bg-black/40 border border-white/10 text-white px-4 py-2 focus:border-teal-500 focus:outline-none font-display text-lg"
          />
        </div>

        {/* Body / Bio */}
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2 flex justify-between items-end">
            <span>Bio (MDX)</span>
          </label>
          <AIToolbar
            content={data.body}
            onContentChange={(newContent) => setData({ ...data, body: newContent })}
          />
          <textarea
            value={data.body}
            onChange={(e) => setData({ ...data, body: e.target.value })}
            rows={15}
            className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:border-teal-500 focus:outline-none mt-2"
            placeholder="Write your bio here... Markdown is supported."
          />
        </div>

      </div>
    </div>
  );
}
