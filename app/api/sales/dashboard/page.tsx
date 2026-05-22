'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
}

export default function SalesDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sales/dashboard/stats', {
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
      // setLoading(false);
    }
  };

  const statusInfo = [
    { key: 'total', label: 'My Leads', icon: '👥', color: 'bg-blue-50 border-blue-200' },
    { key: 'NEW', label: 'New', icon: '📌', color: 'bg-blue-50 border-blue-200' },
    { key: 'CONTACTED', label: 'Contacted', icon: '📞', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'QUALIFIED', label: 'Qualified', icon: '✓', color: 'bg-purple-50 border-purple-200' },
    { key: 'NEGOTIATING', label: 'Negotiating', icon: '💬', color: 'bg-orange-50 border-orange-200' },
    { key: 'CLOSED', label: 'Closed', icon: '✅', color: 'bg-green-50 border-green-200' },
    { key: 'LOST', label: 'Lost', icon: '❌', color: 'bg-red-50 border-red-200' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        {statusInfo.map((status) => {
          const count =
            status.key === 'total'
              ? stats?.total || 0
              : stats?.byStatus[status.key] || 0;

          return (
            <Link
              key={status.key}
              href={
                status.key === 'total'
                  ? '/sales/leads'
                  : `/sales/leads?status=${status.key}`
              }
            >
              <div
                className={`${status.color} border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow`}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {status.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
                <p className="text-2xl mt-2">{status.icon}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Welcome to Your Sales Dashboard
        </h2>
        <p className="text-blue-800">
          View your assigned leads, update call outcomes, and track your progress. Click on "My Leads"
          in the sidebar to see all your assigned leads.
        </p>
      </div>
    </div>
  );
}