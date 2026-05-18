import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, ArrowRight, ArrowLeft, Loader2, ShieldAlert, Shield, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthVisual from './AuthVisual';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setSelectedRole(demoRole);
    setToast('Demo credentials applied successfully');
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const executeLoginGoogle = async (credential, loginRole = selectedRole) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleLogin(credential, loginRole);
      const routes = {
        super_admin: '/admin/dashboard',
        org_admin: '/org/dashboard',
        staff: '/staff/dashboard',
        user: '/dashboard',
      };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => executeLoginGoogle(codeResponse.access_token),
    onError: () => setError('Google Authentication could not be completed.')
  });

  const executeLogin = async (loginEmail, loginPassword, loginRole = selectedRole) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword, loginRole);
      const routes = {
        super_admin: '/admin/dashboard',
        org_admin: '/org/dashboard',
        staff: '/staff/dashboard',
        user: '/dashboard',
      };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex">
      {/* Cinematic Animated Visual Panel */}
      <AuthVisual />

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md animate-fade-in relative z-10 w-full"
        >
          {/* Back Button */}
          <div className="mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="group flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border)] transition-all"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>
          </div>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <span className="text-2xl font-semibold">CaseBridge</span>
          </div>

          <h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-[var(--color-text-muted)] mb-5">Sign in to your account to continue</p>

          {/* Role Selection Tabs */}
          <div className="flex bg-[var(--color-bg-tertiary)] p-1 rounded-lg mb-4 border border-[var(--color-border)] relative">
            {[
              { id: 'super_admin', label: 'Admin' },
              { id: 'org_admin', label: 'Org' },
              { id: 'staff', label: 'Staff' },
              { id: 'user', label: 'User' },
            ].map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-all duration-300 relative z-10 ${
                  selectedRole === role.id 
                    ? 'text-[var(--color-accent)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {selectedRole === role.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-[0_0_12px_rgba(59,130,246,0.3)] border border-blue-500/30 rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {role.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm"
              />
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] text-xs">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 flex justify-center w-full">
              <div className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="relative w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] font-medium transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="tracking-wide">Continue with Google</span>
                </button>
              </div>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'super_admin', label: 'Super Admin', email: 'admin@casebridge.dev', icon: ShieldAlert },
                { role: 'org_admin', label: 'Org Admin', email: 'rajesh@dtu.edu', icon: Shield },
                { role: 'staff', label: 'Staff', email: 'amit@dtu.edu', icon: Users },
                { role: 'user', label: 'User', email: 'arjun@example.com', icon: User },
              ].map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoClick(account.email, account.role)}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[var(--color-text-primary)]">
                      <Icon size={14} className="text-[var(--color-accent)]" />
                      <span className="text-xs font-semibold">{account.label}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] truncate w-full">{account.email}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-accent)] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[var(--color-bg-primary)] border border-green-500/30 text-[var(--color-text-primary)] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-semibold text-xs">
              ✓
            </div>
            <span className="text-xs font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
