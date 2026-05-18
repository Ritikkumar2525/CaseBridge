import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { complaintsAPI, chatAPI } from '../../api';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { initEcho } from '../../utils/echo';
import { ArrowLeft, Send, MessageCircle, Clock, User, AlertCircle, CheckCircle2, Building, Mail, MapPin } from 'lucide-react';

export default function ComplaintView() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [comment, setComment] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [tab, setTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isOrgAdmin, isStaff, isSuperAdmin } = useAuth();

  const canManage = isOrgAdmin || isStaff || isSuperAdmin;

  useEffect(() => {
    complaintsAPI.get(id)
      .then(res => setComplaint(res.data.data))
      .catch(() => navigate('/complaints'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'chat') {
      chatAPI.getMessages(id).then(res => setChatMessages(res.data.data.data || [])).catch(() => {});
    }
  }, [tab, id]);

  useEffect(() => {
    const echo = initEcho();
    if (!echo || !user) return;

    const chatChannel = echo.private(`complaint.${id}.chat`);
    chatChannel.listen('.chat.message.new', (e) => {
      setChatMessages(prev => {
        if (prev.some(m => m._id === e.id || m.id === e.id)) return prev;
        return [...prev, e];
      });
    });

    const channelName = (isOrgAdmin || isStaff) && user.organization_id
      ? `organization.${user.organization_id}`
      : `user.${user.id}`;

    let statusChannel = null;
    if (channelName && !isSuperAdmin) {
      statusChannel = echo.private(channelName);
      statusChannel.listen('.complaint.status.updated', (e) => {
        if (e.complaint_id === id) {
          complaintsAPI.get(id).then(res => setComplaint(res.data.data));
        }
      });
    }

    return () => {
      chatChannel.stopListening('.chat.message.new');
      echo.leave(`complaint.${id}.chat`);
      if (statusChannel) {
        statusChannel.stopListening('.complaint.status.updated');
        echo.leave(channelName);
      }
    };
  }, [id, user, isOrgAdmin, isStaff, isSuperAdmin]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await complaintsAPI.updateStatus(id, newStatus);
      setComplaint(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await complaintsAPI.addComment(id, comment);
      setComplaint(res.data.data);
      setComment('');
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    try {
      const res = await chatAPI.sendMessage(id, chatMsg);
      setChatMessages(prev => [...prev, res.data.data]);
      setChatMsg('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (loading || !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const status = STATUSES[complaint.status] || {};
  const priority = PRIORITIES[complaint.priority] || {};
  const possibleTransitions = {
    CREATED: ['ASSIGNED', 'CLOSED'],
    ASSIGNED: ['IN_PROGRESS', 'CLOSED'],
    IN_PROGRESS: ['ESCALATED', 'RESOLVED', 'CLOSED'],
    ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    RESOLVED: ['CLOSED'],
    CLOSED: [],
  };
  const nextStatuses = possibleTransitions[complaint.status] || [];

  return (
    <div className="min-h-screen">
      <Header title={complaint.title} subtitle={`#${(complaint.id || complaint._id)?.slice(-8)} • ${complaint.category || 'General'}`} />

      <div className="px-8 py-6">
        <button onClick={() => navigate('/complaints')} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Complaints
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Priority */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: status.bg, color: status.color }}>
                {status.label}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: priority.bg, color: priority.color }}>
                {priority.label} Priority
              </span>
            </div>

            {/* Description */}
            <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Description</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              {['details', 'comments', 'chat', 'history'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
                    tab === t
                      ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {t} {t === 'comments' && `(${complaint.comments?.length || 0})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] min-h-[300px]">
              {tab === 'details' && (
                <div className="space-y-6">
                  {/* User & Organization Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-xs">
                        <User size={14} /> Submitter Information
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-2">
                          <span className="text-[var(--color-text-muted)]">Name</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[var(--color-text-muted)] flex items-center gap-1.5"><Mail size={14}/> Email</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-xs">
                        <Building size={14} /> Organization & Location
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-2">
                          <span className="text-[var(--color-text-muted)]">Organization</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.organization?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[var(--color-text-muted)] flex items-center gap-1.5"><MapPin size={14}/> Category (Where/What)</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.category || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-xs">
                        <CheckCircle2 size={14} /> Assignment Details
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-2">
                          <span className="text-[var(--color-text-muted)]">Assigned To</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.assigned_staff?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[var(--color-text-muted)] flex items-center gap-1.5"><Mail size={14}/> Staff Email</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{complaint.assigned_staff?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-xs">
                        <Clock size={14} /> Timing Details
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-2">
                          <span className="text-[var(--color-text-muted)]">Created At</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{new Date(complaint.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[var(--color-text-muted)]">Last Updated</span>
                          <span className="font-medium text-[var(--color-text-primary)]">{new Date(complaint.updated_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {complaint.attachments?.length > 0 && (
                    <div className="pt-4 border-t border-[var(--color-border)] mt-6">
                      <p className="text-[var(--color-text-muted)] text-sm mb-4 font-medium uppercase tracking-wider">Attachments ({complaint.attachments.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {complaint.attachments.map((att, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] text-sm hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer shadow-sm">
                            <span className="truncate flex-1 mr-4 font-medium text-[var(--color-text-secondary)]">{att.filename}</span>
                            <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 px-2 py-1 bg-[var(--color-bg-card)] rounded-md">{(att.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'comments' && (
                <div className="space-y-4">
                  {(complaint.comments || []).map((c, i) => (
                    <div key={i} className="p-4 rounded-lg bg-[var(--color-bg-hover)] animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{c.user_name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">{c.content}</p>
                    </div>
                  ))}
                  <form onSubmit={handleComment} className="flex gap-2 mt-4">
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg transition-colors">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {tab === 'chat' && (
                <div className="flex flex-col h-[300px]">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-10 text-[var(--color-text-muted)]">
                        <MessageCircle size={32} className="mx-auto mb-2" />
                        <p className="text-sm">No messages yet. Start a conversation.</p>
                      </div>
                    ) : chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                          msg.sender_id === user?.id
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
                        }`}>
                          <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleChat} className="flex gap-2">
                    <input
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg transition-colors">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {tab === 'history' && (
                <div className="space-y-3">
                  {(complaint.status_history || []).length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No status changes recorded.</p>
                  ) : (
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--color-border)]" />
                      {(complaint.status_history || []).map((h, i) => {
                        const toStatus = STATUSES[h.to] || {};
                        return (
                          <div key={i} className="relative pb-6 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                            <div className="absolute left-[-18px] w-3 h-3 rounded-full border-2 border-[var(--color-bg-primary)]" style={{ backgroundColor: toStatus.color }} />
                            <div className="ml-4">
                              <p className="text-sm font-medium">
                                <span style={{ color: STATUSES[h.from]?.color }}>{h.from}</span>
                                {' → '}
                                <span style={{ color: toStatus.color }}>{h.to}</span>
                              </p>
                              {h.note && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{h.note}</p>}
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">{new Date(h.changed_at).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            {/* Status Actions */}
            {canManage && nextStatuses.length > 0 && (
              <div className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Actions</h3>
                <div className="space-y-2">
                  {nextStatuses.map(s => {
                    const st = STATUSES[s] || {};
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                        style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.color}30` }}
                      >
                        <CheckCircle2 size={14} />
                        Move to {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Clock size={14} />
                  <span>Created {new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                {complaint.resolved_at && (
                  <div className="flex items-center gap-2 text-[var(--color-success)]">
                    <CheckCircle2 size={14} />
                    <span>Resolved {new Date(complaint.resolved_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
