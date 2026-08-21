"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AdminPageLoader } from "@/components/admin/AdminLoader";

interface SiteSettings {
  name: string;
  title: string;
  github_url: string;
  linkedin_url: string;
  email: string;
  footer_tagline: string;
  copyright_text: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    title: "",
    github_url: "",
    linkedin_url: "",
    email: "",
    footer_tagline: "",
    copyright_text: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/admin/site-settings");
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await fetchApi("/admin/site-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setMessage("Settings saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save settings.");
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
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 ${message.includes("success") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      <div className="bg-forest-900 border border-forest-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={settings.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={settings.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">GitHub URL</label>
          <input
            type="text"
            name="github_url"
            value={settings.github_url}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">LinkedIn URL</label>
          <input
            type="text"
            name="linkedin_url"
            value={settings.linkedin_url}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">Footer Tagline</label>
          <input
            type="text"
            name="footer_tagline"
            value={settings.footer_tagline}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-white/70 mb-1">Copyright Text</label>
          <input
            type="text"
            name="copyright_text"
            value={settings.copyright_text}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black border border-forest-800 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
