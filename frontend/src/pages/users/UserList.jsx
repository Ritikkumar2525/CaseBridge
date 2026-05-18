import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { usersAPI, organizationsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Mail, Phone, Shield, Search, Edit2, Building2, UserCircle } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'user',
    is_active: true,
    organization_id: '',
    phone: ''
  });

  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users and organizations in parallel
      const [usersRes, orgsRes] = await Promise.all([
        usersAPI.list({ per_page: 100 }), // Simplified for now
        organizationsAPI.list({ per_page: 100 })
      ]);
      
      setUsers(usersRes.data.data.data || []);
      setOrganizations(orgsRes.data.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setFormData({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      organization_id: user.organization_id || '',
      phone: user.phone || ''
    });
    setEditingUser(user);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.organization_id === '') payload.organization_id = null;
      
      const res = await usersAPI.update(editingUser.id || editingUser._id, payload);
      
      // Update local state
      setUsers(users.map(u => (u.id || u._id) === (editingUser.id || editingUser._id) ? res.data.data : u));
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => 
    (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-500/15 text-purple-500';
      case 'org_admin': return 'bg-blue-500/15 text-blue-500';
      case 'staff': return 'bg-emerald-500/15 text-emerald-500';
      default: return 'bg-slate-500/15 text-slate-400';
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="min-h-screen pb-12">
      <Header title="User Management" subtitle={`Manage ${users.length} registered accounts`} />

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* User Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
            <Users size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
            <p className="text-[var(--color-text-muted)] text-lg">No users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredUsers.map((user, i) => {
              const userOrg = organizations.find(o => (o.id || o._id) === user.organization_id);
              
              return (
                <div
                  key={user.id || user._id}
                  className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 animate-fade-in group flex flex-col"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-[var(--color-text-primary)] border border-[var(--color-border)] uppercase text-lg shadow-inner">
                        {(user?.name || '?').charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold group-hover:text-[var(--color-accent)] transition-colors">{user?.name || 'Unnamed User'}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 ${getRoleColor(user?.role)}`}>
                          {(user?.role || 'user').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                      title="Edit User Details"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2.5">
                      <Mail size={16} className="text-[var(--color-text-muted)]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={16} className="text-[var(--color-text-muted)]" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {userOrg && (
                      <div className="flex items-center gap-2.5">
                        <Building2 size={16} className="text-[var(--color-text-muted)]" />
                        <span className="truncate">{userOrg.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${user.is_active ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
              <UserCircle className="text-[var(--color-accent)]" size={24} />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Edit User Profile</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                  required 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  value={formData.phone} 
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} 
                  placeholder="e.g. +1 555-1234"
                  className={inputClass} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Platform Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData(f => ({ ...f, role: e.target.value }))} 
                    className={inputClass}
                    disabled={!isSuperAdmin && formData.role === 'super_admin'}
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="org_admin">Org Admin</option>
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Account Status</label>
                  <select 
                    value={formData.is_active.toString()} 
                    onChange={e => setFormData(f => ({ ...f, is_active: e.target.value === 'true' }))} 
                    className={inputClass}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {['staff', 'org_admin'].includes(formData.role) && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Assigned Organization
                  </label>
                  <select 
                    value={formData.organization_id} 
                    onChange={e => setFormData(f => ({ ...f, organization_id: e.target.value }))} 
                    className={inputClass}
                    required
                  >
                    <option value="">Select an organization...</option>
                    {organizations.map(org => (
                      <option key={org.id || org._id} value={org.id || org._id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors shadow-lg shadow-[var(--color-accent)]/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
