import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Building2, BarChart3, ShieldCheck, Bot, Video,
  Bell, MessageCircle, Workflow, Globe, Lock
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { FEATURES_DATA } from '../../data/features';

const iconMap = {
  Building2, BarChart3, ShieldCheck, Bot, Video,
  Bell, MessageCircle, Workflow, Globe, Lock
};

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />

      <div className="relative max-w-[1200px] mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[13px] font-medium text-[var(--color-accent)] tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.02em] gradient-text mb-5">
            Everything you need to manage<br className="hidden md:block" /> complaints at scale
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-[550px] mx-auto text-[15px] leading-relaxed">
            Built with enterprise-grade technology and designed for simplicity.
            Every feature works together seamlessly.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border-subtle)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          {FEATURES_DATA.map((feature, i) => {
            const IconComponent = iconMap[feature.iconName] || Bot;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <Link
                  to={`/features/${feature.id}`}
                  className="block h-full p-7 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.15, rotateZ: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="p-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] group-hover:border-[var(--color-accent)]/20 group-hover:bg-[var(--color-accent)]/[0.06] transition-all duration-300 flex-shrink-0 preserve-3d"
                    >
                      <IconComponent size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-300" />
                    </motion.div>
                    <div>
                      <h3 className="text-[15px] font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-2">
                        {feature.title}
                      </h3>
                      <p className="text-[13px] text-[var(--color-text-dimmed)] leading-relaxed group-hover:text-[var(--color-text-muted)] transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
