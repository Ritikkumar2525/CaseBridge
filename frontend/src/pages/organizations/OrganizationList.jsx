import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { organizationsAPI } from '../../api';
import { ORG_TYPES } from '../../utils/constants';
import { Building2, Users, FileText, Plus, Search, Trash2 } from 'lucide-react';

export default function OrganizationList() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'college', contact_email: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    organizationsAPI.list().then(res => setOrgs(res.data.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await organizationsAPI.create(form);
      const res = await organizationsAPI.list();
      setOrgs(res.data.data.data || []);
      setShowCreate(false);
      setForm({ name: '', type: 'college', contact_email: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation(); // Prevent card click from navigating
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      try {
        await organizationsAPI.delete(id);
        setOrgs(prev => prev.filter(org => (org.id || org._id) !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete organization');
      }
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="min-h-screen">
      <Header title="Organizations" subtitle="Manage all organizations on the platform" />

      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div />
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg text-sm font-medium transition-all">
            <Plus size={16} /> New Organization
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm animate-fade-in">
            <form onSubmit={handleCreate} className="w-full max-w-lg p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold">Create Organization</h2>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Organization Name" className={inputClass} />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
                {Object.entries(ORG_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} required type="email" placeholder="Contact Email" className={inputClass} />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className={inputClass + " resize-none"} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg-hover)] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">Create</button>
              </div>
            </form>
          </div>
        )}

        {/* Organization Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orgs.map((org, i) => (
              <div
                key={org.id || org._id}
                onClick={() => navigate(`/admin/organizations/${org.id || org._id}`)}
                className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all animate-fade-in cursor-pointer group hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/20 flex items-center justify-center">
                    <Building2 size={22} className="text-[var(--color-accent)]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${org.is_active ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, org.id || org._id, org.name)}
                      className="p-1.5 rounded-md hover:bg-[var(--color-error)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Organization"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-[var(--color-accent)] transition-colors">{org.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-3 capitalize">{ORG_TYPES[org.type] || org.type}</p>
                {org.description && <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4">{org.description}</p>}
                <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
                  <span className="flex items-center gap-1"><Users size={12} /> {org.users_count || 0}</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {org.complaints_count || 0}</span>
                  <span>{org.contact_email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
