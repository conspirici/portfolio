"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { AdminTableLoader } from "@/components/admin/AdminLoader";

interface Project {
  id: string;
  title: string;
  status: string;
  is_published: boolean;
  date_updated: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/admin/projects");
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link 
          href="/admin/projects/new" 
          className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200 transition-colors w-full sm:w-auto text-center"
        >
          New Project
        </Link>
      </div>

      <div className="bg-forest-900 border border-forest-800 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-forest-800/50 text-sage-white/70 text-sm border-b border-forest-800">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Published</th>
              <th className="px-6 py-4 font-medium">Last Updated</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-800">
            {loading ? (
              <AdminTableLoader colSpan={5} />
            ) : projects.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sage-white/70">No projects found.</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs ${
                      p.status === 'production' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.is_published ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-sage-white/50">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sage-white/70 text-sm">{new Date(p.date_updated).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/projects/${p.id}`} className="text-blue-400 hover:text-blue-300">
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
