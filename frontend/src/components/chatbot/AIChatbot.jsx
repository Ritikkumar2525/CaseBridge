import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';

const FAQ_RESPONSES = {
  'what is casebridge': 'CaseBridge is a multi-organization complaint management platform. Organizations like colleges, hospitals, and offices can register complaints, track their status in real-time, and resolve them efficiently.',
  'how to register complaint': 'To register a complaint:\n1. Create an account or log in\n2. Go to Dashboard → New Complaint\n3. Fill in the title, description, priority, and category\n4. Submit — your complaint will be tracked in real-time!',
  'how to track complaint': 'Once logged in, go to the Complaints page. You can see all your complaints with their current status (Created, Assigned, In Progress, Escalated, Resolved, Closed). Click any complaint for full details and chat.',
  'what roles are available': 'CaseBridge has 4 roles:\n• Super Admin — manages all organizations\n• Org Admin — manages their organization\n• Staff — handles assigned complaints\n• User — submits and tracks complaints',
  'how does complaint lifecycle work': 'Complaints follow this lifecycle:\nCreated → Assigned → In Progress → Escalated (if needed) → Resolved → Closed\n\nStaff and admins can transition complaints through these stages.',
  'is there real-time chat': 'Yes! Each complaint has a built-in real-time chat thread. Users, staff, and admins can discuss the complaint directly. Messages are delivered instantly via WebSockets.',
  'do you support video meetings': 'Yes! Admin and Organization roles can create video meetings with unique meeting IDs. This helps in resolving complex complaints through face-to-face discussion.',
  'what organizations are supported': 'CaseBridge supports any organization type: colleges, universities, hospitals, government offices, housing societies, corporate offices, and more.',
  'is my data secure': 'Absolutely. CaseBridge uses JWT authentication, encrypted API communication, CORS protection, and organization-scoped data isolation. Your data stays within your organization.',
  'how to contact support': 'You can reach us at support@casebridge.dev or through the Contact form on the landing page. We respond within 24 hours.',
};

const SUGGESTIONS = [
  'What is CaseBridge?',
  'How to register complaint?',
  'How to track complaint?',
  'What roles are available?',
];

function findAnswer(input) {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  // Fuzzy match — check if any keyword matches
  const keywords = lower.split(/\s+/);
  for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
    const keyWords = key.split(/\s+/);
    const matchCount = keywords.filter(w => keyWords.some(k => k.includes(w) || w.includes(k))).length;
    if (matchCount >= 2) return value;
  }
  return "I'm not sure about that. You can ask me about:\n• Registering or tracking complaints\n• How the complaint lifecycle works\n• Available roles and features\n• Security and data privacy\n• Video meetings and chat\n\nOr contact support@casebridge.dev!";
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hi! I'm the CaseBridge assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const answer = findAnswer(msg);
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    }, 800 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.4)] transition-shadow"
          >
            <MessageCircle size={22} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold">CaseBridge AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    <span className="text-[11px] text-[var(--color-text-dimmed)]">Always online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-br-md'
                      : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)]">
                    <div className="typing-indicator flex items-center gap-0.5">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/[0.05] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border-subtle)]">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dimmed)] focus:outline-none focus:border-[var(--color-accent)]/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={14} />
                </button>
              </form>
              <p className="text-center text-[10px] text-[var(--color-text-dimmed)] mt-2">
                <Sparkles size={10} className="inline mr-1" />
                Powered by CaseBridge AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
