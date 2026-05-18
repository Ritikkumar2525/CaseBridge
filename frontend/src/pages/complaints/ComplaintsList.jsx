import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { complaintsAPI } from '../../api';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ 
    status: searchParams.get('status') || '', 
    priority: searchParams.get('priority') || '', 
    search: searchParams.get('search') || '', 
    page: parseInt(searchParams.get('page')) || 1 
  });
  const [loading, setLoading] = useState(true);
  const { isUser } = useAuth();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { per_page: 12, page: filters.page };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await complaintsAPI.list(params);
      setComplaints(res.data.data.data || []);
      setPagination({
        current: res.data.data.current_page,
        last: res.data.data.last_page,
        total: res.data.data.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters.page, filters.status, filters.priority]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
    fetchComplaints();
  };

  const selectClass = "px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="min-h-screen">
      <Header title="Complaints" subtitle={`${pagination.total || 0} total complaints`} />

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </form>

          <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))} className={selectClass}>
            <option value="">All Status</option>
            {Object.entries(STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))} className={selectClass}>
            <option value="">All Priority</option>
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          {isUser && (
            <button
              onClick={() => navigate('/complaints/new')}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/20"
            >
              <Plus size={16} /> New Complaint
            </button>
          )}
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)]">No complaints found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {complaints.map((complaint, i) => {
              const status = STATUSES[complaint.status] || {};
              const priority = PRIORITIES[complaint.priority] || {};
              return (
                <div
                  key={complaint.id || complaint._id}
                  onClick={() => navigate(`/complaints/${complaint.id || complaint._id}`)}
                  className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] cursor-pointer transition-all duration-200 animate-fade-in group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: priority.bg, color: priority.color }}>
                      {priority.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">
                    {complaint.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
                    <span>{complaint.user?.name || 'Unknown'}</span>
                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>

                  {complaint.assigned_staff && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <div className="w-4 h-4 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[8px] font-bold text-[var(--color-accent)]">
                        {complaint.assigned_staff.name?.[0]}
                      </div>
                      <span>Assigned to {complaint.assigned_staff.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.last > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={pagination.current === 1}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-[var(--color-text-muted)] px-4">
              Page {pagination.current} of {pagination.last}
            </span>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={pagination.current === pagination.last}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
