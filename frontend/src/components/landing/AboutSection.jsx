import { useRef, useEffect } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Eye, Target, Layers, Zap } from 'lucide-react';

function AnimatedCounter({ from = 0, to, prefix = '', suffix = '', decimals = 0, inView }) {
  const nodeRef = useRef();

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = prefix + value.toFixed(decimals) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [from, to, prefix, suffix, decimals, inView]);

  return <span ref={nodeRef}>{prefix}{from.toFixed(decimals)}{suffix}</span>;
}

const CARDS = [
  {
    icon: Eye,
    title: 'Vision',
    description: 'To build a world where every complaint is heard, tracked, and resolved — transparently and efficiently across all organizations.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Target,
    title: 'Mission',
    description: 'Empower organizations with intelligent complaint management tools that drive accountability, improve service quality, and build trust.',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: Layers,
    title: 'Scope',
    description: 'From universities to hospitals, government offices to housing societies — CaseBridge scales seamlessly across industries and team sizes.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Zap,
    title: 'Platform Purpose',
    description: 'A centralized hub that replaces fragmented complaint channels with a single, real-time, role-based system powered by AI and modern tech.',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const STATS = [
  { value: 500, suffix: '+', label: 'Organizations', decimals: 0 },
  { value: 50, suffix: 'K+', label: 'Complaints Resolved', decimals: 0 },
  { value: 99.9, suffix: '%', label: 'Uptime', decimals: 1 },
  { value: 2, prefix: '<', suffix: 'h', label: 'Avg Resolution', decimals: 0 },
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px]" />

      <div className="relative max-w-[1200px] mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-medium text-[var(--color-accent)] tracking-widest uppercase mb-4">
            About CaseBridge
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.02em] gradient-text mb-5">
            Built for organizations that care
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-[550px] mx-auto text-[15px] leading-relaxed">
            We believe complaint management should be effortless. CaseBridge turns chaos into clarity
            with smart tracking, real-time updates, and role-based workflows.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{ y: -8, scale: 1.02 }}
              className="feature-card group p-8 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300 preserve-3d"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                <card.icon size={22} className="text-white/80" />
              </div>
              <h3 className="text-lg font-semibold mb-3 tracking-[-0.01em]">
                {card.title}
              </h3>
              <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {STATS.map((stat) => (
            <motion.div 
              whileHover={{ scale: 1.05, rotateZ: 1 }}
              key={stat.label} 
              className="text-center p-6 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <p className="text-3xl font-bold gradient-text-accent">
                <AnimatedCounter 
                  to={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  decimals={stat.decimals} 
                  inView={inView} 
                />
              </p>
              <p className="text-[13px] text-[var(--color-text-dimmed)] mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
