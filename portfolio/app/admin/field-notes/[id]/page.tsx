"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { AdminPageLoader } from "@/components/admin/AdminLoader";

export default function EditFieldNote() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      async function load() {
        try {
          const data = await fetchApi(`/admin/field-notes/${id}`);
          setPhotoUrl(data.photo_url || "");
          setCaption(data.caption || "");
          setLocation(data.location || "");
          setIsPublished(data.is_published || false);
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
        setPhotoUrl(res.url);
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
        photo_url: photoUrl,
        caption,
        location,
        is_published: isPublished,
      };

      if (isNew) {
        await fetchApi("/admin/field-notes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi(`/admin/field-notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/field-notes");
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
        <h1 className="text-3xl font-bold">{isNew ? "New Field Note" : "Edit Field Note"}</h1>
        <div className="space-x-4">
          <Link href="/admin/field-notes" className="text-sage-white/70 hover:text-white transition-colors">
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
            <label className="block text-sm font-medium text-sage-white/70 mb-1">Photo URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="flex-1 px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
              />
              <label className="bg-forest-800 hover:bg-forest-700 text-sage-white px-4 py-2 cursor-pointer transition-colors whitespace-nowrap">
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {photoUrl && (
              <img src={photoUrl} alt="Preview" className="mt-4 h-32 object-cover border border-forest-800" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-white/70 mb-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-white/70 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
            />
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
      </div>
    </div>
  );
}
