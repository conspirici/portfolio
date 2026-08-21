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

export default function EditPost() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [teaser, setTeaser] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

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
          const data = await fetchApi(`/admin/posts/${id}`);
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setTeaser(data.teaser || "");
          setIsPublished(data.is_published || false);
          setBody(data.body || "");
          setCoverImageUrl(data.cover_image_url || "");
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
        setCoverImageUrl(res.url);
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
        teaser,
        is_published: isPublished,
        body,
        cover_image_url: coverImageUrl,
      };

      if (isNew) {
        await fetchApi("/admin/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi(`/admin/posts/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/writing");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminPageLoader />;
  }

  return (
    <div className="p-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{isNew ? "New Post" : "Edit Post"}</h1>
        <div className="space-x-4">
          <Link href="/admin/writing" className="text-sage-white/70 hover:text-white transition-colors">
            Cancel
          </Link>
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
            <label className="block text-sm font-medium text-sage-white/70 mb-1">Teaser</label>
            <textarea
              value={teaser}
              onChange={(e) => setTeaser(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-white/70 mb-1">Cover Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
              />
              <label className="bg-forest-800 hover:bg-forest-700 text-sage-white px-4 py-2 cursor-pointer transition-colors whitespace-nowrap">
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Cover preview" className="mt-4 h-32 object-cover border border-forest-800" />
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
        </div>

        <div className="bg-forest-900 border border-forest-800 p-6">
          <label className="block text-sm font-medium text-sage-white/70 mb-3">MDX Editor</label>
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
