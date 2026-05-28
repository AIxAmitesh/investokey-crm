'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Lead {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  property?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  budget?: string;
  notes?: string;
  source: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ImportLeadsPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'preview' | 'assign'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Step 1: Upload & Parse
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/leads/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse file');
      }

      const data = await response.json();
      setLeads(data.leads);
      setErrors(data.errors);

      if (data.leads.length === 0) {
        setError('No valid leads found in file');
        setLoading(false);
        return;
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.filter((u: any) => u.role === 'SALES_USER'));
      }

      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm Import
  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/leads/confirm-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ leads }),
      });

      if (!response.ok) {
        throw new Error('Failed to import leads');
      }

      const data = await response.json();
      setSuccess(`${data.count} leads imported successfully!`);
      setLeadIds(data.leadIds);
      setStep('assign');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Assign Leads
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/leads/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          leadIds,
          userId: selectedUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign leads');
      }

      const data = await response.json();
      setSuccess(data.message);

      setTimeout(() => {
        router.push('/admin/leads');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/admin/leads');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full h-full overflow-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Bulk Import Leads</h1>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow p-8 w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Upload Excel File</h2>
          <p className="text-gray-600 mb-6">
            Required columns: <strong>Name</strong> and <strong>Phone</strong>
          </p>

          <form onSubmit={handleUpload} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-5xl mb-4">📁</div>
                <p className="font-bold text-gray-900">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">Excel (.xlsx, .xls) or CSV</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload & Preview'}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: PREVIEW */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-8 w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Step 2: Review & Confirm</h2>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-600">{leads.length}</p>
                <p className="text-sm text-gray-600">Valid Leads</p>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-bold text-yellow-900 mb-2">⚠️ {errors.length} rows skipped:</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {errors.slice(0, 5).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                  {errors.length > 5 && <li>... and {errors.length - 5} more</li>}
                </ul>
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto mb-6 border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Phone</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Email</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">City, State</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map((lead, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{lead.firstName} {lead.lastName}</td>
                      <td className="px-4 py-3">{lead.phone}</td>
                      <td className="px-4 py-3">{lead.email || '-'}</td>
                      <td className="px-4 py-3">
                        {lead.city} {lead.state && ', ' + lead.state}
                      </td>
                      <td className="px-4 py-3">{lead.budget || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leads.length > 10 && (
              <p className="text-sm text-gray-600 mb-6 text-center">
                ... and {leads.length - 10} more leads
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep('upload')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Confirm & Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ASSIGN */}
      {step === 'assign' && (
        <div className="bg-white rounded-lg shadow p-8 w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Assign to User</h2>

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-900">
                <strong>{leads.length} leads</strong> are ready to be assigned
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-2">
                Select Sales User *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUserId}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign Leads'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}