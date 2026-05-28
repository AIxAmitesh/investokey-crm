export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'INTERESTED', label: 'Interested', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NOT INTERESTED', label: 'Not Interested', color: 'bg-gray-100 text-gray-700' },
  { value: 'NOT CONTACTED', label: 'Not Contacted', color: 'bg-orange-100 text-orange-800' },
  { value: 'FOLLOW UP', label: 'Follow Up', color: 'bg-purple-100 text-purple-800' },
  { value: 'SITE VISIT', label: 'Site Visit', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
];

export const ROLES = {
  ADMIN: 'ADMIN',
  SALES_USER: 'SALES_USER',
};

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Cold Call',
  'Email Campaign',
  'LinkedIn',
  'Facebook',
  'Google Ads',
  'Bulk Import',
  'Manual',
  'Other',
];