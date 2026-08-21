'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { AdminPageLoader } from "@/components/admin/AdminLoader";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  content_type: string;
  content_title?: string;
}

interface Stats {
  total_projects: number;
  published_posts: number;
  ai_tasks_run: number;
  recent_activity: ActivityLog[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchApi('/admin/stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <AdminPageLoader />;
  if (error) return <div className="p-10 text-red-400">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-forest-900 border border-forest-800 p-6">
          <h3 className="text-sage-white/70 text-sm font-medium">Total Projects</h3>
          <p className="text-3xl font-bold text-sage-white mt-2">{stats.total_projects}</p>
        </div>
        <div className="bg-forest-900 border border-forest-800 p-6">
          <h3 className="text-sage-white/70 text-sm font-medium">Published Posts</h3>
          <p className="text-3xl font-bold text-sage-white mt-2">{stats.published_posts}</p>
        </div>
        <div className="bg-forest-900 border border-forest-800 p-6">
          <h3 className="text-sage-white/70 text-sm font-medium">AI Tasks Run</h3>
          <p className="text-3xl font-bold text-sage-white mt-2">{stats.ai_tasks_run}</p>
        </div>
      </div>

      <div className="bg-forest-900 border border-forest-800 p-6">
        <h2 className="text-xl font-bold mb-4 text-sage-white">Recent Activity</h2>
        {stats.recent_activity.length === 0 ? (
          <p className="text-sage-white/50 text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {stats.recent_activity.map((activity) => (
              <div key={activity.id} className="flex items-center text-sm text-sage-white/80">
                <span className="w-2 h-2 bg-teal-500 mr-3"></span>
                {activity.action} {activity.content_type.toLowerCase()}: {activity.content_title || 'Untitled'}
                <span className="ml-auto text-sage-white/50">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
