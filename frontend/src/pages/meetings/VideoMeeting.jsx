import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { JitsiMeeting } from '@jitsi/react-sdk';
import Header from '../../components/layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff,
  Users, Copy, Check, Link2, Plus, LogIn, Sparkles, Globe, Shield, ArrowRight
} from 'lucide-react';

function generateMeetingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const gen = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${gen(3)}-${gen(4)}-${gen(3)}`;
}

export default function VideoMeeting() {
  const { user, isOrgAdmin, isSuperAdmin } = useAuth();
  const canHost = isOrgAdmin || isSuperAdmin;

  const [view, setView] = useState('lobby'); // lobby | meeting
  const [meetingId, setMeetingId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [copied, setCopied] = useState(false);

  // Meeting controls state
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const handleCreateMeeting = () => {
    const id = generateMeetingId();
    setMeetingId(id);
    setView('meeting');
  };

  const handleJoinMeeting = () => {
    if (!joinId.trim()) return;
    setMeetingId(joinId.trim());
    setView('meeting');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndCall = () => {
    setView('lobby');
    setMeetingId('');
    setVideoOn(true);
    setMicOn(true);
    setScreenOn(false);
  };

  if (view === 'meeting') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Video Meeting" subtitle={`Meeting ID: ${meetingId}`} />

        <div className="flex-1 px-6 py-4 flex flex-col h-[calc(100vh-80px)]">
          {/* Meeting ID Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <Link2 size={14} className="text-[var(--color-accent)]" />
              <span className="text-[13px] text-[var(--color-text-secondary)] font-mono">{meetingId}</span>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} className="text-[var(--color-text-muted)]" />}
              </button>
            </div>
            <button
              onClick={handleEndCall}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center gap-2 text-sm font-medium border border-red-500/20"
            >
              <PhoneOff size={16} /> Leave
            </button>
          </div>

          {/* Jitsi Meeting Frame */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] relative [&>div]:absolute [&>div]:inset-0">
            <JitsiMeeting
              domain="jitsi.riot.im"
              roomName={`CaseBridge-${meetingId}`}
              configOverwrite={{
                startWithAudioMuted: false,
                disableModeratorIndicator: true,
                startScreenSharing: false,
                enableEmailInStats: false,
                prejoinPageEnabled: true,
                disableDeepLinking: true, // Prevents prompting to download the native app
                defaultLanguage: 'en',
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                TOOLBAR_BUTTONS: [
                  'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                  'fodeviceselection', 'hangup', 'profile', 'chat', 'settings',
                  'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                  'tileview', 'select-background', 'download', 'help', 'mute-everyone'
                ],
                SHOW_CHROME_EXTENSION_BANNER: false
              }}
              userInfo={{
                displayName: user?.name || 'Guest Participant',
                email: user?.email || ''
              }}
              onApiReady={(externalApi) => {
                // Attach listeners or execute commands if needed
                externalApi.addListener('videoConferenceLeft', () => {
                  handleEndCall();
                });
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }}
              spinner={() => (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-tertiary)]">
                  <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // Lobby View
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header title="Video Meetings" subtitle="Connect securely with organization members anywhere in the world" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-accent)]/10 to-purple-500/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-sm font-medium mb-6"
          >
            <Sparkles size={16} /> Enterprise Video Infrastructure
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight"
          >
            Seamless collaboration, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-purple-400">zero friction.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--color-text-secondary)] text-lg"
          >
            Host secure, high-definition video calls directly within CaseBridge. No external links, no downloads required.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          {/* Create Meeting Card */}
          {canHost && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all duration-300 group overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 flex items-center justify-center mb-6 shadow-inner">
                  <Video size={28} className="text-[var(--color-accent)]" />
                </div>
                
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Host a Meeting</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
                  Generate an instant, secure meeting room. You will be placed in the room immediately as the moderator.
                </p>
                
                <button
                  onClick={handleCreateMeeting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--color-accent)] to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={20} />
                  Start Instant Meeting
                </button>
              </div>
            </motion.div>
          )}

          {/* Join Meeting Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
            className={`relative p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-emerald-500/50 transition-all duration-300 group overflow-hidden shadow-2xl shadow-black/50 ${!canHost ? 'md:col-span-2 max-w-xl mx-auto w-full' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner">
                <LogIn size={28} className="text-emerald-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Join Meeting</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
                Have an invite code? Enter the 10-character meeting ID to instantly connect to an ongoing room.
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    placeholder="e.g. abc-defg-hij"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono placeholder:text-[var(--color-text-dimmed)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                <button
                  onClick={handleJoinMeeting}
                  disabled={!joinId.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-bg-tertiary)] hover:bg-emerald-500 text-[var(--color-text-primary)] hover:text-white rounded-xl font-semibold border border-[var(--color-border)] hover:border-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed group/btn"
                >
                  Connect
                  <ArrowRight size={18} className="opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-6 text-[var(--color-text-muted)] text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-purple-400" /> End-to-End Encrypted
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-blue-400" /> Global Low-Latency
          </div>
        </motion.div>

      </div>
    </div>
  );
}
