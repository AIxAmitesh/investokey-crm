'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LEAD_STATUSES, LEAD_SOURCES, US_STATES } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
  updatedAt: string;
  assignments: Array<{ user: User }>;
  activities: Activity[];
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    property: '',
    city: '',
    state: '',
    zipCode: '',
    budget: '',
    status: 'NEW',
    source: 'Manual',
    notes: '',
    nextFollowUp: '',
  });

  useEffect(() => {
    fetchLead();
    fetchUsers();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email || '',
          property: data.property || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          budget: data.budget || '',
          status: data.status,
          source: data.source || 'Manual',
          notes: data.notes || '',
          nextFollowUp: data.nextFollowUp ? data.nextFollowUp.split('T')[0] : '',
        });
        if (data.assignments.length > 0) {
          setSelectedUserId(data.assignments[0].user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((u: User) => u.role !== 'ADMIN'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        fetchLead();
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (response.ok) {
        fetchLead();
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
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
      <div className="p-8">
        <p className="text-red-600 text-lg">Lead not found</p>
        <Link href="/admin/leads" className="text-blue-600 hover:underline mt-4">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/admin/leads"
            className="text-blue-600 hover:underline text-sm mb-2"
          >
            ← Back to Leads
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {lead.firstName} {lead.lastName}
          </h1>
        </div>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
            editing
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email || '-'}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="property"
                    value={formData.property}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.property || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.city || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                {editing ? (
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.state || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.zipCode || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.budget || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                {editing ? (
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.source}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {editing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      LEAD_STATUSES.find((s) => s.value === formData.status)
                        ?.color
                    }`}
                  >
                    {LEAD_STATUSES.find((s) => s.value === formData.status)?.label}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Follow-up
                </label>
                {editing ? (
                  <input
                    type="date"
                    name="nextFollowUp"
                    value={formData.nextFollowUp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formData.nextFollowUp
                      ? new Date(formData.nextFollowUp).toLocaleDateString()
                      : '-'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {editing ? (
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {formData.notes || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Assignment */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned To
            </h3>

            <div className="mb-4">
              {lead.assignments.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    {lead.assignments[0].user.name}
                  </p>
                  <p className="text-xs text-blue-700">{lead.assignments[0].user.email}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Unassigned</p>
              )}
            </div>

            <div className="mb-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Assign
            </button>
          </div>

          {/* Meta Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="text-gray-900 font-medium">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Updated</p>
                <p className="text-gray-900 font-medium">
                  {new Date(lead.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity History
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lead.activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-400 pl-3">
                  <p className="text-sm font-medium text-gray-900">
                    {LEAD_STATUSES.find((s) => s.value === activity.status)?.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    by {activity.user.name}
                  </p>
                  {activity.note && (
                    <p className="text-sm text-gray-700 mt-2">{activity.note}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}