import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { dashboardAPI } from '../../api';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, FileText, AlertTriangle, Clock, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
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
    ]).then(([s, c, r]) => {
      setStats(s.data.data);
      setCharts(c.data.data);
      setRecent(r.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topStats = [
    { label: 'Organizations', value: stats?.total_organizations || 0, icon: Building2, color: '#8b5cf6', path: '/admin/organizations' },
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: '#3b82f6', path: '/admin/users' },
    { label: 'Total Complaints', value: stats?.total_complaints || 0, icon: FileText, color: '#06b6d4', path: '/complaints' },
    { label: 'Open Complaints', value: stats?.open_complaints || 0, icon: Clock, color: '#f59e0b', path: '/complaints?status=CREATED' },
    { label: 'Resolved', value: stats?.resolved_complaints || 0, icon: CheckCircle, color: '#22c55e', path: '/complaints?status=RESOLVED' },
    { label: 'High Priority', value: stats?.high_priority || 0, icon: AlertTriangle, color: '#ef4444', path: '/complaints?priority=high' },
    { label: 'Escalated', value: stats?.escalated || 0, icon: Zap, color: '#f59e0b', path: '/complaints?status=ESCALATED' },
    { label: 'Closed', value: stats?.closed_complaints || 0, icon: TrendingUp, color: '#6b7280', path: '/complaints?status=CLOSED' },
  ];

  const statusColors = Object.values(STATUSES).map(s => s.color);
  const priorityColors = Object.values(PRIORITIES).map(p => p.color);

  return (
    <div className="min-h-screen">
      <Header title="Admin Dashboard" subtitle="Global overview of the CaseBridge platform" />

      <div className="px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map((card, i) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] cursor-pointer transition-all duration-300 animate-fade-in hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Bar Chart */}
          <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Complaints by Status</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.status_distribution || []} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {(charts?.status_distribution || []).map((_, i) => (
                      <Cell key={i} fill={statusColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Pie Chart */}
          <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Priority Distribution</h3>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts?.priority_distribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {(charts?.priority_distribution || []).map((_, i) => (
                      <Cell key={i} fill={priorityColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {(charts?.priority_distribution || []).map((p, i) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: priorityColors[i] }} />
                  {p.name}: {p.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recent.map((c) => {
              const status = STATUSES[c.status] || {};
              return (
                <div
                  key={c.id || c._id}
                  onClick={() => navigate(`/complaints/${c.id || c._id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="status-dot" style={{ backgroundColor: status.color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {c.user?.name} • {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
