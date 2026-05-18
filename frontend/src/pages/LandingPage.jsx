import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';
import AIChatbot from '../components/chatbot/AIChatbot';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Cinematic Letterbox Opening Reveal */}
      <motion.div initial={{ height: "50vh" }} animate={{ height: "0vh" }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} className="fixed top-0 left-0 right-0 bg-[var(--color-bg-primary)] z-[10000] pointer-events-none" />
      <motion.div initial={{ height: "50vh" }} animate={{ height: "0vh" }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-primary)] z-[10000] pointer-events-none" />

      {/* Noise texture overlay for premium feel */}
      <div className="noise-overlay" />

      <LandingNavbar />

      <main>
        <HeroSection />

        <div className="section-divider" />
        <AboutSection />

        <div className="section-divider" />
        <FeaturesSection />

        <div className="section-divider" />
        <ContactSection />
      </main>

      <Footer />
      <AIChatbot />
    </div>
  );
}
