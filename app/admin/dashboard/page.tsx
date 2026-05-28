'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byUser: Array<{
    id: string;
    name: string;
    email: string;
    leadCount: number;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; badgeClass: string }> = {
  'NEW':           { label: 'New',           color: '#3B82F6', badgeClass: 'bg-blue-50 border-blue-200 text-blue-900' },
  'INTERESTED':    { label: 'Interested',    color: '#F59E0B', badgeClass: 'bg-yellow-50 border-yellow-200 text-yellow-900' },
  'NOT INTERESTED':{ label: 'Not Interested',color: '#6B7280', badgeClass: 'bg-gray-50 border-gray-200 text-gray-700' },
  'NOT CONTACTED': { label: 'Not Contacted', color: '#F97316', badgeClass: 'bg-orange-50 border-orange-200 text-orange-900' },
  'FOLLOW UP':     { label: 'Follow Up',     color: '#8B5CF6', badgeClass: 'bg-purple-50 border-purple-200 text-purple-900' },
  'SITE VISIT':    { label: 'Site Visit',    color: '#6366F1', badgeClass: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
  'CLOSED':        { label: 'Closed',        color: '#10B981', badgeClass: 'bg-green-50 border-green-200 text-green-900' },
  'LOST':          { label: 'Lost',          color: '#EF4444', badgeClass: 'bg-red-50 border-red-200 text-red-900' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/leads/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const closedCount = stats?.byStatus['CLOSED'] || 0;
  const lostCount = stats?.byStatus['LOST'] || 0;
  const followUpCount = stats?.byStatus['FOLLOW UP'] || 0;
  const siteVisitCount = stats?.byStatus['SITE VISIT'] || 0;
  const total = stats?.total || 0;
  const conversionRate = total ? Math.round((closedCount / total) * 100) : 0;
  const activeLeads = total - closedCount - lostCount;

  const pieData = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => ({
      name: cfg.label,
      value: stats?.byStatus[key] || 0,
      color: cfg.color,
    }))
    .filter((d) => d.value > 0);

  const barData = (stats?.byUser || [])
    .sort((a, b) => b.leadCount - a.leadCount)
    .map((u) => ({ name: u.name.split(' ')[0], leads: u.leadCount }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="mt-3 text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time overview of all leads and sales performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">{activeLeads}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Closed</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600">{closedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Rate: {conversionRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Follow-ups</p>
          <p className="text-3xl sm:text-4xl font-bold text-purple-600">{followUpCount + siteVisitCount}</p>
          <p className="text-xs text-gray-400 mt-1">{followUpCount} follow-up · {siteVisitCount} site visit</p>
        </div>
      </div>

      {/* Charts — only render after hydration to avoid SSR mismatch */}
      {mounted && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h2>
            {pieData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} leads (${total ? Math.round((value / total) * 100) : 0}%)`,
                        name,
                      ]}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No leads yet</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Sales Team Performance</h2>
            {barData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [`${v} leads`, 'Assigned']} />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No sales users yet</div>
            )}
          </div>
        </div>
      )}

      {/* Status Grid */}
      <div className="mb-6">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Leads by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = stats?.byStatus[key] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <Link key={key} href={`/admin/leads?status=${encodeURIComponent(key)}`}>
                <div className={`border rounded-xl p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${cfg.badgeClass}`}>
                  <p className="text-xs sm:text-sm font-semibold mb-1 truncate">{cfg.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{count}</p>
                  <p className="text-xs mt-1 opacity-60">{pct}% of total</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Team Table */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">Sales Team</h2>
          <Link href="/admin/users">
            <span className="text-sm text-blue-600 hover:underline">Manage users →</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sales User</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Leads</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Share</th>
                </tr>
              </thead>
              <tbody>
                {stats?.byUser && stats.byUser.length > 0 ? (
                  [...stats.byUser]
                    .sort((a, b) => b.leadCount - a.leadCount)
                    .map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{user.email}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <Link href={`/admin/leads?assignedTo=${user.id}`}>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-200">
                              {user.leadCount} leads
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${total ? Math.min(100, Math.round((user.leadCount / total) * 100)) : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{total ? Math.round((user.leadCount / total) * 100) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No sales users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/admin/leads">
          <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 sm:p-5 cursor-pointer transition-colors">
            <p className="text-base sm:text-lg font-semibold">View All Leads</p>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">{total} total leads</p>
          </div>
        </Link>
        <Link href="/admin/add-lead">
          <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 sm:p-5 cursor-pointer transition-colors">
            <p className="text-base sm:text-lg font-semibold">Add New Lead</p>
            <p className="text-green-100 text-xs sm:text-sm mt-1">Manually create a lead</p>
          </div>
        </Link>
        <Link href="/admin/import-leads">
          <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 sm:p-5 cursor-pointer transition-colors">
            <p className="text-base sm:text-lg font-semibold">Import Leads</p>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">Bulk upload from Excel/CSV</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
