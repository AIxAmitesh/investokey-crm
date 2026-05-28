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
  const [assignMsg, setAssignMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    property: '', city: '', state: '', zipCode: '',
    budget: '', status: 'NEW', source: 'Manual', notes: '', nextFollowUp: '',
  });

  useEffect(() => {
    fetchLead();
    fetchUsers();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        setFormData({
          firstName: data.firstName, lastName: data.lastName, phone: data.phone,
          email: data.email || '', property: data.property || '', city: data.city || '',
          state: data.state || '', zipCode: data.zipCode || '', budget: data.budget || '',
          status: data.status, source: data.source || 'Manual', notes: data.notes || '',
          nextFollowUp: data.nextFollowUp ? data.nextFollowUp.split('T')[0] : '',
        });
        if (data.assignments.length > 0) setSelectedUserId(data.assignments[0].user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u: User) => u.role !== 'ADMIN'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setEditing(false); fetchLead(); }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (res.ok) { setAssignMsg('Assigned!'); fetchLead(); setTimeout(() => setAssignMsg(''), 2000); }
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const fieldValue = (val: string | undefined) => <p className="text-gray-900 text-sm py-1">{val || '—'}</p>;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="mt-3 text-gray-600 text-sm">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <p className="text-red-600">Lead not found</p>
        <Link href="/admin/leads" className="text-blue-600 hover:underline mt-2 inline-block text-sm">← Back to Leads</Link>
      </div>
    );
  }

  const statusBadge = LEAD_STATUSES.find((s) => s.value === formData.status);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Link href="/admin/leads" className="text-blue-600 hover:underline text-xs sm:text-sm mb-1 inline-block">
            ← Back to Leads
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            {lead.firstName} {lead.lastName}
          </h1>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className={`px-5 py-2 rounded-lg text-white font-medium text-sm transition-colors ${
              editing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-8">
        {/* ── Main Content ── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name</label>
                {editing ? <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.firstName)}
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
                {editing ? <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.lastName)}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                {editing ? <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.phone)}
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                {editing ? <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.email)}
              </div>
              {/* Property */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Property</label>
                {editing ? <input type="text" name="property" value={formData.property} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.property)}
              </div>
              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City</label>
                {editing ? <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.city)}
              </div>
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State</label>
                {editing ? (
                  <select name="state" value={formData.state} onChange={handleInputChange} className={inputClass}>
                    <option value="">Select State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : fieldValue(formData.state)}
              </div>
              {/* Zip */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ZIP Code</label>
                {editing ? <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.zipCode)}
              </div>
              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Budget</label>
                {editing ? <input type="text" name="budget" value={formData.budget} onChange={handleInputChange} className={inputClass} /> : fieldValue(formData.budget)}
              </div>
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                {editing ? (
                  <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                    {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                ) : (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${statusBadge?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusBadge?.label || formData.status}
                  </span>
                )}
              </div>
              {/* Source */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Source</label>
                {editing ? (
                  <select name="source" value={formData.source} onChange={handleInputChange} className={inputClass}>
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : fieldValue(formData.source)}
              </div>
              {/* Next Follow-up */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Next Follow-up</label>
                {editing ? (
                  <input type="date" name="nextFollowUp" value={formData.nextFollowUp} onChange={handleInputChange} className={inputClass} />
                ) : fieldValue(formData.nextFollowUp ? new Date(formData.nextFollowUp).toLocaleDateString() : '')}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
              {editing ? (
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={4} className={inputClass + ' resize-none'} />
              ) : (
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{formData.notes || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">
          {/* Assignment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned To</h3>
            {lead.assignments.length > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-blue-900">{lead.assignments[0].user.name}</p>
                <p className="text-xs text-blue-600">{lead.assignments[0].user.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">Unassigned</p>
            )}
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">Select User</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedUserId}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-40"
            >
              {assignMsg || 'Assign'}
            </button>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="font-medium text-gray-900">{new Date(lead.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity History</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {lead.activities.length > 0 ? lead.activities.map((act) => {
                const statusInfo = LEAD_STATUSES.find((s) => s.value === act.status);
                return (
                  <div key={act.id} className="border-l-2 border-blue-400 pl-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                      {statusInfo?.label || act.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">by {act.user.name}</p>
                    {act.note && <p className="text-xs text-gray-700 mt-1">{act.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                );
              }) : (
                <p className="text-sm text-gray-400">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
