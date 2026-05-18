import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { dashboardAPI, complaintsAPI } from '../../api';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function UserDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      dashboardAPI.getCharts(),
      dashboardAPI.getRecent(),
    ]).then(([statsRes, chartsRes, recentRes]) => {
      setStats(statsRes.data.data);
      setCharts(chartsRes.data.data);
      setRecent(recentRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Complaints', value: stats?.total_complaints || 0, icon: FileText, color: 'var(--color-accent)' },
    { label: 'Open', value: stats?.open_complaints || 0, icon: Clock, color: 'var(--color-warning)' },
    { label: 'Resolved', value: stats?.resolved_complaints || 0, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'Closed', value: stats?.closed_complaints || 0, icon: AlertTriangle, color: 'var(--color-text-muted)' },
  ];

  const statusColors = Object.values(STATUSES).map(s => s.color);

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back! Here's an overview of your complaints." />

      <div className="px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 animate-fade-in group cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => navigate('/complaints')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Distribution */}
          <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Status Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.status_distribution || []}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(charts?.status_distribution || []).map((_, i) => (
                      <Cell key={i} fill={statusColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {(charts?.status_distribution || []).filter(s => s.value > 0).map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[i] }} />
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Complaint Trend (30 Days)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.trend_data || []}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="complaints" stroke="var(--color-accent)" fill="url(#colorComplaints)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Complaints</h3>
            <button
              onClick={() => navigate('/complaints')}
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">No complaints yet.</p>
                <button
                  onClick={() => navigate('/complaints/new')}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  <Plus size={14} /> Submit your first complaint
                </button>
              </div>
            ) : (
              recent.map((complaint) => {
                const status = STATUSES[complaint.status] || {};
                const priority = PRIORITIES[complaint.priority] || {};
                return (
                  <div
                    key={complaint.id || complaint._id}
                    onClick={() => navigate(`/complaints/${complaint.id || complaint._id}`)}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="status-dot flex-shrink-0" style={{ backgroundColor: status.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--color-accent)] transition-colors">{complaint.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: priority.bg, color: priority.color }}>
                        {priority.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
