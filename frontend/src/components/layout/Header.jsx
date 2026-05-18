import { Bell, Search, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    notificationsAPI.list({ per_page: 1 })
      .then(res => setUnreadCount(res.data.unread_count || 0))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-strong">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* New Complaint Button */}
          {(user?.role === 'user' || user?.role === 'org_admin') && (
            <button
              onClick={() => navigate('/complaints/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/20"
            >
              <Plus size={16} />
              <span>New Complaint</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--color-error)] rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse-glow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
