import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Mail, MapPin, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { publicAPI } from '../../api';

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await publicAPI.submitContact(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Failed to send contact message:', err);
      setStatus('idle'); // Could also set an 'error' state, but defaulting to idle for simplicity
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-dimmed)] focus:outline-none focus:border-[var(--color-accent)]/40 focus:bg-[var(--color-bg-hover)] transition-all duration-300`;

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px]" />

      <div className="relative max-w-[1200px] mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium text-[var(--color-accent)] tracking-widest uppercase mb-4">
            Contact
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.02em] gradient-text mb-5">
            Get in touch
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-[500px] mx-auto text-[15px] leading-relaxed">
            Have questions about CaseBridge or need support with your complaint?
            We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              { icon: Mail, label: 'Email', value: 'support@casebridge.dev', sub: 'We reply within 24 hours' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210', sub: 'Mon-Fri, 9AM-6PM IST' },
              { icon: MapPin, label: 'Office', value: 'Delhi Technological University', sub: 'New Delhi, India 110042' },
            ].map((info, i) => (
              <div
                key={info.label}
                className="flex items-start gap-4 p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border)] transition-all"
              >
                <div className="p-2.5 rounded-lg bg-[var(--color-accent)]/[0.06] border border-[var(--color-accent)]/10">
                  <info.icon size={18} className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-[13px] text-[var(--color-text-dimmed)] mb-0.5">{info.label}</p>
                  <p className="text-[14px] font-medium">{info.value}</p>
                  <p className="text-[12px] text-[var(--color-text-dimmed)] mt-1">{info.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[12px] text-[var(--color-text-dimmed)] uppercase tracking-wider mb-2 font-medium">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-text-dimmed)] uppercase tracking-wider mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[12px] text-[var(--color-text-dimmed)] uppercase tracking-wider mb-2 font-medium">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={5}
                  placeholder="Tell us about your issue or question..."
                  className={inputClass + ' resize-none'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium text-[14px] hover:bg-[var(--color-accent-hover)] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-[0_0_30px_var(--color-accent-subtle)]"
              >
                {status === 'idle' && <><Send size={15} /> Send Message</>}
                {status === 'sending' && <><Loader2 size={15} className="animate-spin" /> Sending...</>}
                {status === 'sent' && <><CheckCircle size={15} /> Message Sent!</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
