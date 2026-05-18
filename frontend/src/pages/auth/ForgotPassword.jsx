import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthVisual from './AuthVisual';

export default function ForgotPassword() {
  const [stage, setStage] = useState(1); // 1 = Email, 2 = OTP & New Password, 3 = Success
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStage(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (form.otp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp({
        email: email,
        otp: form.otp,
        password: form.password,
        password_confirmation: form.password_confirmation
      });
      setStage(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete password reset.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex">
      {/* Cinematic Animated Visual Panel */}
      <AuthVisual />

      {/* Right Panel — Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-[var(--color-bg-primary)]">
        
        <div className="w-full max-w-md relative z-10 w-full" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          
          {/* Back Button */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/login')} 
              className="group flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border)] transition-all"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Login</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STAGE 1: Request OTP */}
            {stage === 1 && (
              <motion.div
                key="stage1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="lg:hidden flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
                    <Layers size={20} className="text-white" />
                  </div>
                  <span className="text-2xl font-semibold">CaseBridge</span>
                </div>

                <h2 className="text-3xl font-semibold mb-2">Reset password</h2>
                <p className="text-[var(--color-text-muted)] mb-8">Enter your email address to receive a secure 6-digit reset code.</p>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Email address</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-50 text-sm mt-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Send login link</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STAGE 2: Verify OTP & Change Password */}
            {stage === 2 && (
              <motion.div
                key="stage2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-semibold mb-2">Verify & Reset</h2>
                <p className="text-[var(--color-text-muted)] mb-8">We sent a verification code to <span className="text-[var(--color-text-primary)] font-medium">{email}</span>. Check your inbox (or logs).</p>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">6-Digit Code</label>
                    <input 
                      type="text" 
                      placeholder="123456" 
                      maxLength="6"
                      value={form.otp} 
                      onChange={(e) => setForm({...form, otp: e.target.value.replace(/\D/g, '')})} 
                      required 
                      className={`${inputClass} text-center tracking-[0.5em] font-mono text-lg`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 mt-4">New Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required placeholder="Min 8 chars, 1 uppercase, 1 symbol" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Confirm New Password</label>
                    <input type="password" value={form.password_confirmation} onChange={(e) => setForm({...form, password_confirmation: e.target.value})} required placeholder="••••••••" className={inputClass} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || form.otp.length !== 6 || !form.password}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-50 text-sm mt-6"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Reset Password</span><CheckCircle2 size={16} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STAGE 3: Success Screen */}
            {stage === 3 && (
              <motion.div
                key="stage3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-3xl font-semibold mb-3 text-[var(--color-text-primary)]">Password Updated!</h2>
                <p className="text-[var(--color-text-muted)] mb-8">Your casebridge account has been secured with your new password.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full justify-center flex items-center px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all text-sm font-medium"
                >
                  Return to Login
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
