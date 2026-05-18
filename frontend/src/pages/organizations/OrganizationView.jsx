import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { organizationsAPI } from '../../api';
import { Building2, Users, FileText, Mail, Phone, MapPin, ChevronLeft, Calendar, Shield, Activity, Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { ORG_TYPES } from '../../utils/constants';

export default function OrganizationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, statsRes, staffRes] = await Promise.all([
          organizationsAPI.get(id),
          organizationsAPI.getStats(id),
          organizationsAPI.getStaff(id)
        ]);
        
        setOrg(orgRes.data.data);
        setStats(statsRes.data.data);
        setStaff(staffRes.data.data || []);
      } catch (err) {
        console.error('Failed to load organization details:', err);
        // Optionally redirect or show an error state here if 403/404
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${org.name}"? This action cannot be undone.`)) {
      try {
        await organizationsAPI.delete(id);
        navigate('/admin/organizations');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete organization');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
        <button onClick={() => navigate('/admin/organizations')} className="text-[var(--color-accent)] hover:underline">
          Return to Organizations
        </button>
      </div>
    );
  }

  // Pre-calculate some quick stats to display
  const totalComplaints = stats?.total_complaints || 0;
  const resolvedComplaints = stats?.complaints_by_status?.RESOLVED || 0;
  const openComplaints = totalComplaints - resolvedComplaints;

  const statCards = [
    { label: 'Total Complaints', value: totalComplaints, icon: FileText, color: '#06b6d4' },
    { label: 'Open Issues', value: openComplaints, icon: Clock, color: '#f59e0b' },
    { label: 'Resolved', value: resolvedComplaints, icon: CheckCircle, color: '#22c55e' },
    { label: 'Active Users', value: stats?.total_users || 0, icon: Users, color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen pb-12">
      <Header 
        title={org.name} 
        subtitle={`Registered ${new Date(org.created_at).toLocaleDateString()}`}
        customLeft={
          <button 
            onClick={() => navigate('/admin/organizations')}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        }
        customRight={
          org && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} /> Delete Organization
            </button>
          )
        }
      />

      <div className="px-8 py-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Top Info Banner */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--color-accent)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/20 flex items-center justify-center border border-[var(--color-accent)]/20 shadow-lg shadow-[var(--color-accent)]/10">
              <Building2 size={36} className="text-[var(--color-accent)]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] truncate">{org.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${org.is_active ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
                  {org.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] capitalize border border-[var(--color-border)]">
                  {ORG_TYPES[org.type] || org.type}
                </span>
              </div>
              
              <p className="text-[var(--color-text-muted)] text-sm mb-5 max-w-3xl leading-relaxed">
                {org.description || 'No description provided for this organization.'}
              </p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--color-text-secondary)]">
                {org.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-[var(--color-accent)]" />
                    <span>{org.contact_email}</span>
                  </div>
                )}
                {org.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-[var(--color-accent)]" />
                    <span>{org.contact_phone}</span>
                  </div>
                )}
                {org.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[var(--color-accent)]" />
                    <span>{org.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <h3 className="text-lg font-semibold mt-8 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-[var(--color-accent)]" />
          Platform Usage Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Staff Section */}
        <h3 className="text-lg font-semibold mt-8 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-[var(--color-accent)]" />
          Assigned Staff & Admins
        </h3>
        
        {staff.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[var(--color-border)] text-center text-[var(--color-text-muted)]">
            <Users size={32} className="mx-auto mb-3 opacity-40" />
            <p>No staff members assigned to this organization yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member, i) => (
              <div 
                key={member.id || member._id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-[var(--color-text-primary)] border border-[var(--color-border)] uppercase">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{member.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{member.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-[var(--color-accent)]/10 text-[var(--color-accent)] uppercase whitespace-nowrap">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
