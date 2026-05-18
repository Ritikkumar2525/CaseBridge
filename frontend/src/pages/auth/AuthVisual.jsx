import { Layers } from 'lucide-react';
import { motion } from 'framer-motion';

// Generates continuous data streaming laser lines
const DataFlows = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-80">
      {[...Array(15)].map((_, i) => {
        const top = Math.random() * 100;
        const duration = Math.random() * 4 + 3;
        const delay = Math.random() * 5;
        const width = Math.random() * 150 + 100;
        const color = Math.random() > 0.5 ? 'var(--color-accent)' : 'rgb(168, 85, 247)'; // alternating blue/purple

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              height: '2px',
              width: `${width}px`,
              top: `${top}%`,
              left: '-200px',
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
              filter: 'blur(1px)'
            }}
            animate={{ x: ["0vw", "120vw"] }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
              delay: delay
            }}
          />
        );
      })}
    </div>
  );
};

export default function AuthVisual() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)]">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-purple-500/5 z-0" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[var(--color-accent)]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5aDQwTTM5IDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] z-0 pointer-events-none opacity-30" />

      {/* Cinematic Data Flow animation */}
      <DataFlows />

      {/* 3D Animated Content Container */}
      <motion.div 
        className="relative z-10 preserve-3d h-full flex flex-col justify-between"
        initial={{ opacity: 0, rotateY: -15, x: -40 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1200 }}
      >
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center gap-3 backdrop-blur-sm p-2 rounded-2xl w-fit"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Layers size={20} className="text-white relative z-10" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] drop-shadow-lg">CaseBridge</span>
          </motion.div>
        </div>

        <div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold leading-[1.1] text-[var(--color-text-primary)] drop-shadow-2xl" 
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Streamline your<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">data workflow</span><br />
            across organizations.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-6 text-xl text-[var(--color-text-muted)] max-w-md leading-relaxed font-light"
          >
            A high-performance centralized platform for managing complaints, powered by real-time telemetry.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-4"
        >
          <div className="flex -space-x-4">
            <div className="w-10 h-10 rounded-full border-2 border-black bg-blue-500/20 backdrop-blur-md flex items-center justify-center text-[10px] text-blue-200">U</div>
            <div className="w-10 h-10 rounded-full border-2 border-black bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-[10px] text-purple-200">H</div>
            <div className="w-10 h-10 rounded-full border-2 border-black bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-[10px] text-indigo-200">O</div>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-dimmed)] tracking-wider uppercase">
            Trusted Infrastructure
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
