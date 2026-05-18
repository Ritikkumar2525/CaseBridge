// OrgDashboard and StaffDashboard share the same structure as UserDashboard
// but with different stats and context. They reuse the same pattern.

import UserDashboard from './UserDashboard';

// Org Admin Dashboard — same component, the API returns org-specific stats
export default function OrgDashboard() {
  return <UserDashboard />;
}
