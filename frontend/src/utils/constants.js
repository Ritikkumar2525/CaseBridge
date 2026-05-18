// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Status configuration
export const STATUSES = {
  CREATED: { label: 'Created', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  ASSIGNED: { label: 'Assigned', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  ESCALATED: { label: 'Escalated', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  RESOLVED: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  CLOSED: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export const PRIORITIES = {
  low: { label: 'Low', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export const ROLES = {
  user: 'User',
  staff: 'Staff',
  org_admin: 'Organization Admin',
  super_admin: 'Super Admin',
};

export const ORG_TYPES = {
  college: 'College',
  hospital: 'Hospital',
  office: 'Office',
  society: 'Society',
  other: 'Other',
};
