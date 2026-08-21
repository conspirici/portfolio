"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { AdminTableLoader } from "@/components/admin/AdminLoader";

interface FieldNote {
  id: string;
  photo_url: string;
  caption: string;
  location: string;
  date_taken: string | null;
  is_published: boolean;
}

export default function AdminFieldNotes() {
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/admin/field-notes");
        setNotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Field Notes</h1>
        <Link 
          href="/admin/field-notes/new" 
          className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors"
        >
          New Note
        </Link>
      </div>

      <div className="bg-forest-900 border border-forest-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-forest-800/50 text-sage-white/70 text-sm border-b border-forest-800">
            <tr>
              <th className="px-6 py-4 font-medium">Preview</th>
              <th className="px-6 py-4 font-medium">Caption</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Published</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-800">
            {loading ? (
              <AdminTableLoader colSpan={5} />
            ) : notes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sage-white/70">No field notes found.</td></tr>
            ) : (
              notes.map((n) => (
                <tr key={n.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <img src={n.photo_url} alt="preview" className="w-16 h-16 object-cover" />
                  </td>
                  <td className="px-6 py-4 font-medium">{n.caption || "—"}</td>
                  <td className="px-6 py-4 text-sage-white/70 text-sm">{n.location || "—"}</td>
                  <td className="px-6 py-4">
                    {n.is_published ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-sage-white/50">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/field-notes/${n.id}`} className="text-blue-400 hover:text-blue-300">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
