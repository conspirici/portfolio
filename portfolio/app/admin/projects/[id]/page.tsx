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
  const [gradientFrom, setGradientFrom] = useState("#288760");
  const [gradientTo, setGradientTo] = useState("#075057");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoLabel, setNewVideoLabel] = useState("");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          setGradientFrom(data.gradient_from || "#288760");
          setGradientTo(data.gradient_to || "#075057");
          setLiveUrl(data.live_url || "");
          setGithubUrl(data.github_url || "");
          setSelectedTags(data.tags?.map((t: any) => t.id) || []);
          setVideos(data.videos || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      load();
    }
    
    async function loadTags() {
      try {
        const tags = await fetchApi('/admin/tags');
        setAvailableTags(tags);
      } catch (err) {
        console.error(err);
      }
    }
    loadTags();
  }, [id, isNew]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // fetchApi sets application/json by default unless body is FormData
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
        live_url: liveUrl,
        github_url: githubUrl,
        tags: selectedTags,
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

  const handleAddVideo = async () => {
    if (isNew) {
      alert("Please save the project first before adding videos.");
      return;
    }
    if (!newVideoUrl || !newVideoLabel) return;
    
    try {
      const res = await fetchApi(`/admin/projects/${id}/videos`, {
        method: "POST",
        body: JSON.stringify({
          youtube_url: newVideoUrl,
          label: newVideoLabel,
          order_index: videos.length
        })
      });
      setVideos([...videos, res]);
      setNewVideoUrl("");
      setNewVideoLabel("");
    } catch (err) {
      console.error(err);
      alert("Failed to add video");
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await fetchApi(`/admin/projects/${id}/videos/${videoId}`, {
        method: "DELETE"
      });
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  };

  if (loading) {
    return <AdminPageLoader />;
  }

  return (
    <div className="p-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{isNew ? "New Project" : "Edit Project"}</h1>
        <div className="space-x-4">
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
            className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Live URL</label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">GitHub URL</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Gradient From</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="w-10 h-10 bg-black border border-forest-800 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={gradientFrom}
                  onChange={(e) => setGradientFrom(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors font-mono uppercase text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-white/70 mb-1">Gradient To</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="w-10 h-10 bg-black border border-forest-800 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={gradientTo}
                  onChange={(e) => setGradientTo(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors font-mono uppercase text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
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
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="Thumbnail preview" className="mt-4 h-32 object-cover border border-forest-800" />
            )}
          </div>
          <div className="flex items-center space-x-3">
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
          <div>
            <label className="block text-sm font-medium text-sage-white/70 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (selectedTags.includes(tag.id)) {
                      setSelectedTags(selectedTags.filter(id => id !== tag.id));
                    } else {
                      setSelectedTags([...selectedTags, tag.id]);
                    }
                  }}
                  className={`px-3 py-1 text-sm font-mono transition-colors border ${
                    selectedTags.includes(tag.id)
                      ? "bg-white text-black border-white"
                      : "bg-black text-sage-white/70 border-forest-800 hover:border-sage-white/50"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-forest-900 border border-forest-800 p-6">
          <label className="block text-sm font-medium text-sage-white/70 mb-4">Project Videos</label>
          {isNew ? (
            <div className="text-sage-white/50 text-sm">Save the project first to add videos.</div>
          ) : (
            <div className="space-y-4">
              {videos.length > 0 && (
                <div className="space-y-2 mb-6">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between bg-black p-3 border border-forest-800">
                      <div>
                        <div className="text-white font-medium">{video.label}</div>
                        <div className="text-sage-white/60 text-xs font-mono">{video.youtube_url}</div>
                      </div>
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-black p-4 border border-forest-800">
                <h4 className="text-white text-sm mb-3">Add New Video</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-sage-white/70 mb-1">YouTube URL</label>
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-forest-900 border border-forest-800 text-white focus:outline-none focus:border-white transition-colors text-sm"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-sage-white/70 mb-1">Label</label>
                    <input
                      type="text"
                      value={newVideoLabel}
                      onChange={(e) => setNewVideoLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-forest-900 border border-forest-800 text-white focus:outline-none focus:border-white transition-colors text-sm"
                      placeholder="e.g. Platform Walkthrough"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddVideo}
                  disabled={!newVideoUrl || !newVideoLabel}
                  className="bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Add Video
                </button>
              </div>
            </div>
          )}
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
