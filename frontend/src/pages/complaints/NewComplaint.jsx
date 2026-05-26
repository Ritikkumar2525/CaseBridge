import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { complaintsAPI, organizationsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, Loader2, Send } from 'lucide-react';

export default function NewComplaint() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '', organization_id: '' });
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    organizationsAPI.list({ per_page: 100 })
      .then((res) => {
        const orgList = res.data.data.data || [];
        setOrganizations(orgList);
        
        // Default to user's assigned organization if set
        if (user?.organization_id) {
          const userOrg = orgList.find(o => o.id === user.organization_id || o._id === user.organization_id);
          if (userOrg) {
            setForm(f => ({ ...f, organization_id: userOrg.id || userOrg._id }));
          }
        } else if (orgList.length > 0) {
          setForm(f => ({ ...f, organization_id: orgList[0].id || orgList[0]._id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingOrgs(false));
  }, [user]);

  const handleOrgChange = (orgId) => {
    setForm(f => ({ ...f, organization_id: orgId, category: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = { ...form };
      if (files.length > 0) data.attachments = files;
      await complaintsAPI.create(data);
      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all text-sm";

  return (
    <div className="min-h-screen">
      <Header title="New Complaint" subtitle="Submit a new complaint to your organization" />

      <div className="px-8 py-6 max-w-2xl">
        <button onClick={() => navigate('/complaints')} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
              minLength={5}
              placeholder="Brief summary of the issue"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              required
              minLength={10}
              rows={5}
              placeholder="Provide detailed information about the issue..."
              className={inputClass + " resize-none"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Organization</label>
            {loadingOrgs ? (
              <div className="h-[46px] w-full bg-[var(--color-bg-tertiary)] animate-pulse rounded-lg border border-[var(--color-border)]" />
            ) : (
              <select
                value={form.organization_id}
                onChange={(e) => handleOrgChange(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id || org._id} value={org.id || org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Priority</label>
              <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Category</label>
              {(() => {
                const selectedOrg = organizations.find(o => (o.id || o._id) === form.organization_id);
                const categories = selectedOrg?.settings?.categories || [];
                return categories.length > 0 ? (
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    required
                    className={inputClass}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., Infrastructure"
                    className={inputClass}
                  />
                );
              })()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Attachments</label>
            <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ position: 'relative' }}
              />
              <Upload size={24} className="mx-auto text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag to upload (max 10MB each)'}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit Complaint</>}
          </button>
        </form>
      </div>
    </div>
  );
}
