'use client';

import { useState } from 'react';

interface UpdateLeadModalProps {
  isOpen: boolean;
  lead: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateLeadModal({
  isOpen,
  lead,
  onClose,
  onSuccess,
}: UpdateLeadModalProps) {
  const [status, setStatus] = useState(lead?.status || 'NEW');
  const [notes, setNotes] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATING', 'CLOSED', 'LOST'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/sales/leads/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          leadId: lead.id,
          status,
          notes,
          nextFollowUp,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update lead');
      }

      setSuccess('Lead updated successfully!');
      setTimeout(() => {
        setStatus(lead.status);
        setNotes('');
        setNextFollowUp('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Update Lead</h2>
          <p className="text-sm text-gray-600 mt-1">
            {lead.firstName} {lead.lastName}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Lead Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{lead.phone}</p>
            </div>
            {lead.email && (
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{lead.email}</p>
              </div>
            )}
            {lead.property && (
              <div>
                <p className="text-gray-600">Property</p>
                <p className="font-medium text-gray-900">{lead.property}</p>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this lead..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Next Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Follow-up Date
            </label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors text-sm"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}