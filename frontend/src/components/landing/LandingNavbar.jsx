import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Layers } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <Layers size={16} className="text-white" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">
                CaseBridge
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3.5 py-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-bg-hover)]/50"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA + Theme Toggle */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]/50 transition-all"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-[var(--color-bg-hover)] border border-[var(--color-border)]' : 'bg-[var(--color-accent)] border border-[var(--color-accent)]'
                }`}>
                  <div className={`absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-sm ${
                    isDark ? 'left-[2px] bg-[var(--color-text-muted)]' : 'left-[19px] bg-white'
                  }`} />
                </div>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-[13px] font-medium bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-all hover:shadow-[0_0_20px_rgba(139,105,20,0.15)]"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-1 transition-all"
              >
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-[var(--color-bg-hover)] border border-[var(--color-border)]' : 'bg-[var(--color-accent)] border border-[var(--color-accent)]'
                }`}>
                  <div className={`absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-sm ${
                    isDark ? 'left-[2px] bg-[var(--color-text-muted)]' : 'left-[19px] bg-white'
                  }`} />
                </div>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 glass-strong md:hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-3 text-left text-[15px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]/50 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="section-divider my-4" />
              <button
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                className="px-4 py-3 text-left text-[15px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Log in
              </button>
              <button
                onClick={() => { setMobileOpen(false); navigate('/register'); }}
                className="px-4 py-3 text-[15px] font-medium bg-[var(--color-accent)] text-white rounded-lg text-center"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
