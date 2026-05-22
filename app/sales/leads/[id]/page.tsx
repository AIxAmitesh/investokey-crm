'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Activity {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  property?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  budget?: string;
  status: string;
  source?: string;
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
  assignments: Array<{ user: User }>;
  activities: Activity[];
}

export default function SalesLeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityNote, setActivityNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('NEW');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/sales/leads/${leadId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setSelectedStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!activityNote.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/sales/leads/${leadId}/update-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: selectedStatus,
          note: activityNote,
        }),
      });

      if (response.ok) {
        setActivityNote('');
        fetchLead();
        setMessage('Activity added successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      setMessage('Failed to add activity');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-red-600">Lead not found</p>
        <Link href="/sales/leads" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Link href="/sales/leads" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lead.firstName} {lead.lastName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{lead.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="text-lg font-medium text-gray-900">{lead.property || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-lg font-medium text-gray-900">{lead.budget || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-lg font-medium text-gray-900">{lead.city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {lead.status}
                </span>
              </div>
            </div>

            {lead.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-gray-600">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h3>

            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {message}
              </div>
            )}

            {/* Add Activity Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="CLOSED">Closed</option>
                <option value="LOST">Lost</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Note
              </label>
              <textarea
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                placeholder="Add a note about your interaction with this lead..."
                rows={3}
                disabled={submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
              />

              <button
                onClick={handleAddActivity}
                disabled={submitting || !activityNote.trim()}
                className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Adding...' : 'Add Activity'}
              </button>
            </div>

            {/* Activities List */}
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-3">
                {lead.activities.map((activity) => (
                  <div key={activity.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{activity.user.name}</p>
                        <p className="text-sm text-gray-600">{activity.note}</p>
                      </div>
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No activities yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Info Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-gray-900 mb-4">Lead Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="font-medium text-gray-900">{lead.source || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
              {lead.nextFollowUp && (
                <div>
                  <p className="text-xs text-gray-500">Next Follow-up</p>
                  <p className="font-medium text-gray-900">
                    {new Date(lead.nextFollowUp).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">ZIP Code</p>
                <p className="font-medium text-gray-900">{lead.zipCode || '-'}</p>
              </div>
            </div>
          </div>

          {/* Assigned To Card */}
          {lead.assignments && lead.assignments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-gray-900 mb-3">Assigned To</h3>
              <div className="space-y-2">
                {lead.assignments.map((assignment) => (
                  <div
                    key={assignment.user.id}
                    className="p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <p className="font-medium text-sm text-gray-900">{assignment.user.name}</p>
                    <p className="text-xs text-gray-500">{assignment.user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
