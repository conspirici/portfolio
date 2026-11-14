"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AdminPageLoader } from "@/components/admin/AdminLoader";
import { MDXRemote } from "next-mdx-remote";
import { compileMdx } from "../../mdx-action";
import { Aside, ImageCarousel, ImageGrid, VideoEmbed, Mermaid } from "@/components/mdx";
import { AIToolbar } from "@/components/admin/AIToolbar";

const components = {
  Aside,
  ImageCarousel,
  ImageGrid,
  VideoEmbed,
  Mermaid,
  pre: (props: any) => {
    const child = props.children;
    const isMermaid = child?.props?.['data-mermaid'];
    if (isMermaid) return <>{props.children}</>;
    return <pre {...props} />;
  },
  code: (props: any) => {
    if (props["data-mermaid"]) {
      return <Mermaid chart={props.children} />;
    }
    return <code {...props} />;
  },
};

export default function EditProject() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [body, setBody] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState("draft");
  
  // New State variables for Task 5
  const [gradientFrom, setGradientFrom] = useState("");
  const [gradientTo, setGradientTo] = useState("");
  // Mirrors the API's ProjectVideoResponse. The video with order_index 0 is the
  // project's overview video; the rest are listed after it in order.
  const [videos, setVideos] = useState<
    { id: string; youtube_url: string; label: string; order_index: number }[]
  >([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoIsOverview, setNewVideoIsOverview] = useState(false);
  
  const [tags, setTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState("");
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // The thumbnail URL whose preview failed to load, if any. Keyed by URL so a
  // newly uploaded or retyped one gets a fresh chance.
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
  const thumbnailFailed = failedThumbnailUrl === thumbnailUrl;

  const [compiledMdx, setCompiledMdx] = useState<any>(null);
  const [mdxError, setMdxError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!body) {
        setCompiledMdx(null);
        setMdxError(null);
        return;
      }
      const { compiledSource, error } = await compileMdx(body);
      if (error) {
        setMdxError(error);
      } else {
        setMdxError(null);
        setCompiledMdx(compiledSource);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [body]);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await fetchApi('/admin/tags');
        setAllTags(data || []);
      } catch (err) {
        console.error("Failed to load tags", err);
      }
    }
    loadTags();
  }, []);

  useEffect(() => {
    if (!isNew) {
      async function load() {
        try {
          const data = await fetchApi(`/admin/projects/${id}`);
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setSummary(data.summary || "");
          setIsPublished(data.is_published || false);
          setBody(data.body || "");
          setThumbnailUrl(data.thumbnail_url || "");
          setStatus(data.status || "draft");
          setGradientFrom(data.gradient_from || "");
          setGradientTo(data.gradient_to || "");
          setTags(data.tags || []);
          setVideos(data.videos || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [id, isNew]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchApi("/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.url) {
        setThumbnailUrl(res.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      // Clear the picker so choosing the same file again still triggers an upload.
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        summary,
        is_published: isPublished,
        body,
        thumbnail_url: thumbnailUrl,
        status,
        gradient_from: gradientFrom,
        gradient_to: gradientTo,
        tags: tags.map(t => t.id)
      };

      if (isNew) {
        await fetchApi("/admin/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi(`/admin/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/projects");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
    try {
      await fetchApi(`/admin/projects/${id}`, {
        method: "DELETE",
      });
      router.push("/admin/projects");
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };
  
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await fetchApi("/admin/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTagName, type: "tech" })
      });
      setNewTagName("");
      const data = await fetchApi('/admin/tags');
      setAllTags(data || []);
      // Intentionally NOT auto-assigning newly created tags to current project per instructions
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTag = (tag: any) => {
    if (tags.find(t => t.id === tag.id)) {
      setTags(tags.filter(t => t.id !== tag.id));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddVideo = async () => {
    if (isNew) {
      alert("Please save the project first before adding videos.");
      return;
    }
    if (!newVideoUrl || !newVideoTitle) return;
    try {
      const payload = {
        youtube_url: newVideoUrl,
        label: newVideoTitle,
        order_index: newVideoIsOverview
          ? 0
          : Math.max(0, ...videos.map((v) => v.order_index)) + 1,
      };
      const created = await fetchApi(`/admin/projects/${id}/videos`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setVideos((prev) => [...prev, created]);
      setNewVideoUrl("");
      setNewVideoTitle("");
      setNewVideoIsOverview(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add video");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Remove this video?")) return;
    try {
      await fetchApi(`/admin/projects/${id}/videos/${videoId}`, {
        method: "DELETE"
      });
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove video");
    }
  };

  if (loading) {
    return <AdminPageLoader />;
  }

  return (
    <div className="p-4 md:p-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">{isNew ? "New Project" : "Edit Project"}</h1>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <Link href="/admin/projects" className="text-sage-white/70 hover:text-white transition-colors">
            Cancel
          </Link>
          {!isNew && (
            <button 
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Info */}
          <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-forest-800 pb-2">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 bg-black border-forest-800 focus:ring-white focus:ring-2"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-white">
                Published (visible on public site)
              </label>
            </div>
          </div>
          
          {/* Media & Appearance */}
          <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-forest-800 pb-2">Appearance</h2>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Thumbnail URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
                />
                <label className="bg-forest-800 hover:bg-forest-700 text-sage-white px-4 py-2 cursor-pointer transition-colors whitespace-nowrap">
                  {uploading ? "Uploading..." : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
              {thumbnailUrl && (
                <div className="mt-3">
                  {thumbnailFailed ? (
                    <div className="aspect-video w-full border border-red-500/30 bg-red-500/10 flex items-center justify-center p-4 text-center text-sm text-red-400">
                      This image could not be loaded. Check the URL, or upload it again.
                    </div>
                  ) : (
                    // Plain <img>: a preview of whatever URL is in the field, with no
                    // optimizer in between, so a broken link is obvious straight away.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      onError={() => setFailedThumbnailUrl(thumbnailUrl)}
                      className="aspect-video w-full object-cover border border-forest-800 bg-black"
                    />
                  )}
                  <p className="mt-2 text-xs text-sage-white/50">
                    Shown on the project card. Click Save Changes to keep it.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-sage-white/70 mb-1">Gradient From</label>
                <input
                  type="color"
                  value={gradientFrom || "#000000"}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="w-full h-10 bg-black border border-forest-800 p-1"
                />
                <input
                  type="text"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  placeholder="#HexCode"
                  className="w-full mt-2 px-2 py-1 bg-black border border-forest-800 text-white text-xs font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-sage-white/70 mb-1">Gradient To</label>
                <input
                  type="color"
                  value={gradientTo || "#000000"}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="w-full h-10 bg-black border border-forest-800 p-1"
                />
                <input
                  type="text"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  placeholder="#HexCode"
                  className="w-full mt-2 px-2 py-1 bg-black border border-forest-800 text-white text-xs font-mono"
                />
              </div>
            </div>
            
            {(gradientFrom || gradientTo) && (
              <div 
                className="mt-4 h-24 w-full border border-forest-800 rounded"
                style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
              >
                <div className="w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                  <span className="text-sm font-mono text-white tracking-widest">PREVIEW</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-forest-800 pb-2">Tags</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            {allTags.map(tag => {
              const isSelected = tags.find(t => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 border text-sm font-mono ${isSelected ? 'bg-sage-white text-black border-sage-white' : 'bg-transparent text-sage-white border-forest-800 hover:border-sage-white/50'}`}
                >
                  {tag.name} {isSelected && "×"}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input 
              type="text" 
              placeholder="New tag name" 
              value={newTagName} 
              onChange={e => setNewTagName(e.target.value)}
              className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none text-sm"
            />
            <button onClick={handleAddTag} className="bg-forest-800 px-4 py-2 text-sm">Create</button>
          </div>
        </div>
        
        {/* Videos */}
        <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-forest-800 pb-2">Videos</h2>
          
          <div className="space-y-4 mb-6">
            {videos.length === 0 ? (
              <p className="text-sage-white/50 text-sm">No videos attached to this project.</p>
            ) : (
              videos.map((vid) => (
                <div key={vid.id} className="flex items-center justify-between bg-black p-4 border border-forest-800">
                  <div>
                    <p className="font-medium">{vid.label} {vid.order_index === 0 && <span className="ml-2 text-xs bg-forest-700 px-2 py-1 rounded">Overview</span>}</p>
                    <p className="text-xs text-sage-white/60 font-mono mt-1">{vid.youtube_url}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(vid.id)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1">Remove</button>
                </div>
              ))
            )}
          </div>
          
          <div className="bg-black p-4 border border-forest-800">
            <h3 className="text-sm font-medium mb-4">Add New Video</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="YouTube URL" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} className="px-4 py-2 bg-forest-900 border border-forest-800 text-white text-sm" />
              <input type="text" placeholder="Title" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} className="px-4 py-2 bg-forest-900 border border-forest-800 text-white text-sm" />
              <label className="flex items-center space-x-2 text-sm text-sage-white">
                <input type="checkbox" checked={newVideoIsOverview} onChange={e => setNewVideoIsOverview(e.target.checked)} className="bg-forest-900" />
                <span>Is Overview Video</span>
              </label>
            </div>
            <button onClick={handleAddVideo} className="mt-4 bg-white text-black font-medium text-sm px-4 py-2 hover:bg-gray-200">Add Video</button>
          </div>
        </div>

        <div className="bg-forest-900 border border-forest-800 p-6">
          <label className="block text-sm font-medium text-sage-white/70 mb-3">MDX Body</label>
          <AIToolbar content={body} onContentChange={setBody} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={25}
              className="w-full px-4 py-3 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors font-mono text-sm resize-y"
            />
            <div className="border border-forest-800 bg-black p-6 overflow-y-auto max-h-[600px]">
              {mdxError ? (
                <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">{mdxError}</div>
              ) : compiledMdx ? (
                <div className="prose prose-teal max-w-none prose-invert">
                  <MDXRemote {...compiledMdx} components={components} />
                </div>
              ) : (
                <div className="text-sage-white/50 text-sm">Preview will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
