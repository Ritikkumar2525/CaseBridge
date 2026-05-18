import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Search } from 'lucide-react';

export default function HeroSection() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const rotateXScroll = useTransform(scrollYProgress, [0, 0.5], [15, 0]);

  // 3D Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      id="hero" 
      ref={ref} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-[160px] pb-20 overflow-hidden flex flex-col items-center" 
      style={{ perspective: '1200px' }}
    >
      {/* Cinematic Overlays */}
      <div className="cinematic-spotlight" />
      <div className="absolute inset-0 glow-top" />
      <div className="cinematic-lens-flare" />

      {/* Grid */}
      <div className="absolute inset-0 hero-grid opacity-60" />

      {/* Radial fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent z-10" />

      {/* Floating orbs with cinematic colors */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[150px] animate-float opacity-80" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/[0.05] blur-[120px] animate-float opacity-80" style={{ animationDelay: '-3s' }} />

      {/* Main Content Area - Cinematic Slow Zoom In */}
      <motion.div 
        initial={{ scale: 1.05, filter: "blur(15px)", opacity: 0 }}
        animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ y, scale: useTransform(scrollYProgress, [0, 0.5], [1, 0.96]) }} 
        className="relative z-20 max-w-[900px] mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span className="text-[12px] text-[var(--color-text-muted)] tracking-wide">
            Now supporting 500+ organizations
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6"
        >
          <span className="gradient-text-hero">Complaint management</span>
          <br />
          <span className="gradient-text-hero">for modern </span>
          <span className="gradient-text-accent">organizations</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-[clamp(1rem,2vw,1.2rem)] text-[var(--color-text-muted)] max-w-[600px] mx-auto mb-10 leading-relaxed"
        >
          A centralized platform for colleges, hospitals, offices, and societies
          to manage, track, and resolve complaints efficiently with real-time updates.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="group flex items-center gap-2.5 px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium text-[14px] hover:bg-[var(--color-accent-hover)] transition-all hover:shadow-[0_0_30px_var(--color-accent-subtle)]"
          >
            <FileText size={16} />
            Register Complaint
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="group flex items-center gap-2.5 px-6 py-3 border border-[var(--color-border)] rounded-xl text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)] transition-all"
          >
            <Search size={16} />
            Track Complaint
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-[var(--color-text-dimmed)]"
        >
          {['Universities', 'Hospitals', 'Offices', 'Societies'].map((name, i) => (
            <div key={name} className="flex items-center gap-2 text-[13px]">
              <div className="w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">
                {name[0]}
              </div>
              <span className="hidden sm:inline">{name}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 150, rotateX: 35, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
          style={{ rotateX: rotateXScroll }}
          transition={{ delay: 1.0, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative preserve-3d"
        >
          {/* Interactive Tilt Container */}
          <motion.div
            style={{ rotateX: tiltX, rotateY: tiltY, zIndex: 10, transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Soft Breathing Floating Effect */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-b from-[var(--color-accent)]/10 to-transparent rounded-2xl blur-2xl" style={{ transform: "translateZ(-20px)" }} />
              <div 
                className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm"
                style={{ transform: "translateZ(20px)" }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-[var(--color-bg-tertiary)] text-[11px] text-[var(--color-text-dimmed)] tracking-wider">
                      app.casebridge.dev/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    {[
                      { label: 'Open', value: '24', color: '#f59e0b' },
                      { label: 'In Progress', value: '12', color: '#3b82f6' },
                      { label: 'Resolved', value: '156', color: '#22c55e' },
                      { label: 'Total', value: '192', color: '#8b5cf6' },
                    ].map((stat, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + idx * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        key={stat.label} 
                        className="flex-1 p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] backdrop-blur-md"
                        style={{ transform: "translateZ(30px)" }}
                      >
                        <div className="w-2 h-2 rounded-full mb-3 shadow-lg" style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }} />
                        <p className="text-xl font-semibold">{stat.value}</p>
                        <p className="text-[11px] text-[var(--color-text-dimmed)] mt-1">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {['Infrastructure maintenance needed in Block B', 'WiFi connectivity issues in library', 'Lab equipment repair request'].map((title, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8 + i * 0.1, duration: 0.5 }}
                        whileHover={{ x: 5 }}
                        key={i} 
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-bg-hover)]"
                        style={{ transform: "translateZ(10px)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e'][i] }} />
                          <span className="text-[13px] text-[var(--color-text-secondary)]">{title}</span>
                        </div>
                        <span className="text-[11px] text-[var(--color-text-dimmed)]">{['2h ago', '5h ago', '1d ago'][i]}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
