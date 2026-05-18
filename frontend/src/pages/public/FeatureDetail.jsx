import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { FEATURES_DATA } from '../../data/features';
import * as Icons from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- MOCK COMPONENTS ---

const MockDashboard = () => {
  const [progress, setProgress] = useState([10, 40, 80]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev.map(p => (p >= 100 ? 0 : p + Math.random() * 15)));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 flex gap-2">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-[10px] text-green-500 font-mono tracking-widest uppercase">WebSocket Connected</span>
      </div>
      <h4 className="text-sm font-semibold mb-6 text-[var(--color-text-secondary)]">Live Complaint Pipeline</h4>
      <div className="space-y-6">
        {['IT Support - Network Down', 'HR - Payroll Issue', 'Maintenance - Broken AC'].map((title, i) => (
          <div key={i} className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl border border-[var(--color-border-subtle)]">
            <div className="flex justify-between text-xs mb-2 text-[var(--color-text-dimmed)]">
              <span>{title}</span>
              <span>{Math.floor(progress[i])}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-bg-hover)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-[var(--color-accent)]"
                animate={{ width: `${progress[i]}%` }}
                transition={{ type: 'tween', duration: 1.5, ease: 'linear' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockAIChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am CaseBridge AI. How can I help you categorise your complaint today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const simulateChat = async () => {
    if (messages.length > 1) return;
    setMessages(prev => [...prev, { sender: 'user', text: 'The projector in Room 4B is flashing red.' }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsTyping(false);
    setMessages(prev => [...prev, { sender: 'ai', text: 'I understand. A flashing red light usually indicates an overheating lamp. I have automatically categorized this as "Hardware Issue" and pre-filled a priority-medium ticket for IT Maintenance. Would you like me to submit it?' }]);
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl flex flex-col h-[400px] shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Icons.Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium">CaseBridge AI</p>
            <p className="text-[10px] text-[var(--color-text-dimmed)]">Online</p>
          </div>
        </div>
        <button onClick={simulateChat} className="text-xs px-3 py-1.5 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] rounded-md transition-colors flex items-center gap-1.5">
          <Play size={12} /> Start Demo
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'ai' ? 'bg-[var(--color-bg-tertiary)] self-start rounded-tl-none' : 'bg-[var(--color-accent)] text-white self-end rounded-tr-none'}`}
            >
              {msg.text}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[var(--color-bg-tertiary)] self-start p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dimmed)] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dimmed)] animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-dimmed)] animate-bounce" style={{ animationDelay: '0.4s' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MockAnalytics = () => {
  const data = [
    { name: 'Mon', resolved: 4000, incoming: 2400 },
    { name: 'Tue', resolved: 3000, incoming: 1398 },
    { name: 'Wed', resolved: 2000, incoming: 9800 },
    { name: 'Thu', resolved: 2780, incoming: 3908 },
    { name: 'Fri', resolved: 1890, incoming: 4800 },
    { name: 'Sat', resolved: 2390, incoming: 3800 },
    { name: 'Sun', resolved: 3490, incoming: 4300 },
  ];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 h-[400px] shadow-2xl flex flex-col">
      <h4 className="text-sm font-semibold mb-6 text-[var(--color-text-secondary)]">Weekly Resolution Trends</h4>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="resolved" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorResolved)" />
            <Area type="monotone" dataKey="incoming" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncoming)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MockStaticFallback = ({ feature }) => {
  const Icon = Icons[feature.iconName];
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl h-[400px] shadow-2xl flex items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-hover)]/30 to-transparent" />
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[400px] h-[400px] bg-[var(--color-accent)]/5 blur-[100px] rounded-full"
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center mb-6 backdrop-blur-md">
          {Icon && <Icon size={40} className="text-[var(--color-accent)]" />}
        </div>
        <p className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]">{feature.title} Engine</p>
        <p className="text-sm text-[var(--color-text-dimmed)] mt-2">Enterprise-grade architecture.</p>
      </div>
    </div>
  );
};


// --- MAIN PAGE ---

export default function FeatureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const feature = FEATURES_DATA.find(f => f.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Feature not found</h2>
          <button onClick={() => navigate('/')} className="text-[var(--color-accent)] hover:underline">Return Home</button>
        </div>
      </div>
    );
  }

  const IconComponent = Icons[feature.iconName] || Icons.HelpCircle;

  return (
    <div className="min-h-screen pt-20 pb-32">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 hero-grid opacity-20" />
      </div>

      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 relative z-10">
        
        <button 
          onClick={() => navigate('/#features')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-dimmed)] hover:text-[var(--color-text-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Features
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-32 items-center">
          
          {/* Left Content Area */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-8">
              <IconComponent size={14} className="text-[var(--color-accent)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">Core Feature</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
              {feature.title}
            </h1>
            
            <p className="text-[1.1rem] text-[var(--color-text-muted)] leading-[1.8] mb-12 pr-4">
              {feature.longDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 text-base bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                Try this Demo Live
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dimmed)] mb-6">Key Benefits</h3>
              {feature.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Interactive Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="w-full"
          >
            {feature.demoType === 'real-time-dashboard' && <MockDashboard />}
            {feature.demoType === 'ai-chat-simulator' && <MockAIChat />}
            {feature.demoType === 'analytics-charts' && <MockAnalytics />}
            {['visual-hierarchy', 'static-mockup', 'lifecycle-workflow'].includes(feature.demoType) && <MockStaticFallback feature={feature} />}
          </motion.div>

        </div>

        {/* Real World Scenarios */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-32 pt-20 border-t border-[var(--color-border)]"
        >
          <h3 className="text-2xl font-bold text-center mb-12">Real-world Application</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feature.useCases.map((useCase, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 text-[var(--color-accent)] font-mono text-sm">
                  0{i + 1}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {useCase}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
