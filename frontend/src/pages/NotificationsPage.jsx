import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { notificationsAPI } from '../api';
import { Bell, CheckCheck, MessageCircle, FileText, UserPlus, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  complaint_created: FileText,
  complaint_assigned: UserPlus,
  status_updated: ArrowUpRight,
  comment_added: MessageCircle,
  chat_message: MessageCircle,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = () => {
    notificationsAPI.list({ per_page: 50 }).then(res => {
      setNotifications(res.data.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllAsRead();
    fetch();
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      await notificationsAPI.markAsRead(n.id || n._id);
    }
    if (n.data?.complaint_id) {
      navigate(`/complaints/${n.data.complaint_id}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Notifications" subtitle={`${unreadCount} unread`} />

      <div className="px-8 py-6 max-w-3xl">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline">
              <CheckCheck size={16} /> Mark all as read
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
            <p className="text-[var(--color-text-muted)]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <div
                  key={n.id || n._id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all animate-fade-in ${
                    n.is_read
                      ? 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      : 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/10'
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={`p-2 rounded-lg ${n.is_read ? 'bg-[var(--color-bg-hover)]' : 'bg-[var(--color-accent)]/15'}`}>
                    <Icon size={16} className={n.is_read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-accent)]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.is_read ? 'text-[var(--color-text-secondary)]' : ''}`}>{n.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
