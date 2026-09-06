"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AdminPageLoader } from "@/components/admin/AdminLoader";
import Image from "next/image";

interface HomeContent {
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string;
  hero_logo_urls: string[];
}

export default function AdminHomeContent() {
  const [data, setData] = useState<HomeContent>({
    hero_headline: "",
    hero_subheadline: "",
    hero_image_url: "",
    hero_logo_urls: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi("/admin/home-content");
        if (res) {
          setData({
            hero_headline: res.hero_headline || "",
            hero_subheadline: res.hero_subheadline || "",
            hero_image_url: res.hero_image_url || "",
            hero_logo_urls: res.hero_logo_urls || [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await fetchApi("/admin/home-content", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setMessage("Home content saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save home content.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchApi("/admin/upload", {
        method: "POST",
        body: formData,
      },); // isMultipart handled internally by fetchApi
      if (res.url) {
        setData({ ...data, hero_image_url: res.url });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchApi("/admin/upload", {
        method: "POST",
        body: formData,
      },); // isMultipart
      if (res.url) {
        setData({ ...data, hero_logo_urls: [...data.hero_logo_urls, res.url] });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = (indexToRemove: number) => {
    setData({
      ...data,
      hero_logo_urls: data.hero_logo_urls.filter((_, i) => i !== indexToRemove),
    });
  };

  if (loading) return <AdminPageLoader />;

  return (
    <div className="p-4 md:p-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Home Content</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 ${message.includes("success") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      <div className="bg-forest-900 border border-forest-800 p-8 space-y-8">
        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Hero Headline
          </label>
          <input
            type="text"
            value={data.hero_headline}
            onChange={(e) => setData({ ...data, hero_headline: e.target.value })}
            placeholder="e.g. Meet Brainka,"
            className="w-full bg-black/40 border border-white/10 text-white px-4 py-2 focus:border-teal-500 focus:outline-none font-display text-2xl"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Hero Subheadline
          </label>
          <input
            type="text"
            value={data.hero_subheadline}
            onChange={(e) => setData({ ...data, hero_subheadline: e.target.value })}
            placeholder="e.g. and discover connections you didn't know existed."
            className="w-full bg-black/40 border border-white/10 text-white px-4 py-2 focus:border-teal-500 focus:outline-none font-sans"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Main Hero Portrait Image
          </label>
          {data.hero_image_url && (
            <div className="mb-4 relative w-48 h-48 bg-black/40 border border-white/10">
              <Image src={data.hero_image_url} alt="Hero Portrait" fill className="object-cover grayscale" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
          {uploadingImage && <span className="ml-4 text-sage-white/60 text-sm">Uploading...</span>}
        </div>

        <div>
          <label className="block text-sm font-mono text-sage-white/60 uppercase tracking-wider mb-2">
            Scattered Tech Logos
          </label>
          <div className="flex flex-wrap gap-4 mb-4">
            {data.hero_logo_urls.map((url, i) => (
              <div key={i} className="relative w-16 h-16 bg-black/40 border border-white/10 p-2 group">
                <Image src={url} alt={`Logo ${i}`} fill className="object-contain p-2" />
                <button 
                  onClick={() => removeLogo(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
          {uploadingLogo && <span className="ml-4 text-sage-white/60 text-sm">Uploading...</span>}
          <p className="mt-2 text-xs text-sage-white/40">Upload logos one by one. They will be scattered around your portrait.</p>
        </div>
      </div>
    </div>
  );
}
