'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/leads/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { key: 'NEW', label: 'New', icon: '📌', color: 'blue' },
    { key: 'CONTACTED', label: 'Contacted', icon: '📞', color: 'yellow' },
    { key: 'QUALIFIED', label: 'Qualified', icon: '✓', color: 'purple' },
    { key: 'NEGOTIATING', label: 'Negotiating', icon: '💬', color: 'orange' },
    { key: 'CLOSED', label: 'Closed', icon: '✅', color: 'green' },
    { key: 'LOST', label: 'Lost', icon: '❌', color: 'red' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
    };
    return colors[color];
  };

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Overview of all leads and sales team performance</p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Total Leads Card */}
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Leads</p>
            <p className="text-4xl font-bold text-gray-900">{stats?.total || 0}</p>
            <p className="text-3xl mt-4">📊</p>
          </div>

          {/* Leads by Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leads by Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statuses.map((status) => {
                const count = stats?.byStatus[status.key] || 0;
                return (
                  <Link
                    key={status.key}
                    href={`/admin/leads?status=${status.key}`}
                  >
                    <div
                      className={`border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow ${getColorClasses(
                        status.color
                      )}`}
                    >
                      <p className="text-sm font-medium mb-2">{status.label}</p>
                      <p className="text-3xl font-bold">{count}</p>
                      <p className="text-2xl mt-3">{status.icon}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sales Team Performance */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Team Performance</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Sales User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Assigned Leads
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.byUser && stats.byUser.length > 0 ? (
                    stats.byUser.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link href={`/admin/leads?assignedTo=${user.id}`}>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold cursor-pointer hover:bg-blue-200">
                              {user.leadCount} leads
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No sales users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Closed Deals */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Closed Deals</h3>
              <p className="text-3xl font-bold text-green-700">
                {stats?.byStatus['CLOSED'] || 0}
              </p>
              <p className="text-sm text-green-800 mt-2">
                Conversion rate: {stats?.total ? Math.round(((stats?.byStatus['CLOSED'] || 0) / stats.total) * 100) : 0}%
              </p>
            </div>

            {/* Lost Deals */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Lost Deals</h3>
              <p className="text-3xl font-bold text-red-700">
                {stats?.byStatus['LOST'] || 0}
              </p>
              <p className="text-sm text-red-800 mt-2">
                Lost rate: {stats?.total ? Math.round(((stats?.byStatus['LOST'] || 0) / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Admin Dashboard Overview
            </h2>
            <p className="text-blue-800 mb-4">
              Track all leads, monitor sales team performance, and manage lead distribution. Click on any status
              card to view leads in that category, or click on a sales user to see their assigned leads.
            </p>
            <div className="flex gap-4">
              <Link href="/admin/leads">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  View All Leads
                </button>
              </Link>
              <Link href="/admin/users">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Manage Users
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}