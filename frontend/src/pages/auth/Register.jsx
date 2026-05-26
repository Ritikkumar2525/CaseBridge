import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthVisual from './AuthVisual';
import { useGoogleLogin } from '@react-oauth/google';
import { organizationsAPI } from '../../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'user', organization_id: '', organization_name: '' });
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    organizationsAPI.publicList()
      .then((res) => {
        setOrganizations(res.data.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load organizations', err);
      })
      .finally(() => setLoadingOrgs(false));
  }, []);

  const executeLoginGoogle = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleLogin(credential);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm";

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex">
      {/* Cinematic Animated Visual Panel */}
      <AuthVisual />

      {/* Right Panel — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-[var(--color-bg-primary)]">
        
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

          <h2 className="text-2xl font-semibold mb-1">Create an account</h2>
          <p className="text-[var(--color-text-muted)] mb-5">Join CaseBridge to start managing workflow data</p>

          {/* Account Type Selection Tabs */}
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
                onClick={() => setForm({ ...form, role: role.id, organization_id: '' })}
                className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-all duration-300 relative z-10 ${
                  form.role === role.id 
                    ? 'text-[var(--color-accent)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {form.role === role.id && (
                  <motion.div
                    layoutId="activeTabRegister"
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm" />
          </div>

          {form.role === 'org_admin' && (
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Organization Name</label>
              <input 
                id="organization_name" 
                name="organization_name" 
                value={form.organization_name} 
                onChange={handleChange} 
                required 
                placeholder="e.g., City General Hospital" 
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email address</label>
            <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm" />
          </div>

          {(form.role === 'user' || form.role === 'staff') && (
            <div>
              <label htmlFor="organization_id" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Organization</label>
              {loadingOrgs ? (
                <div className="h-10 w-full bg-[var(--color-bg-tertiary)] animate-pulse rounded-lg border border-[var(--color-border)]" />
              ) : (
                <select 
                  id="organization_id" 
                  name="organization_id" 
                  value={form.organization_id} 
                  onChange={handleChange} 
                  required 
                  className={inputClass}
                >
                  <option value="" className="bg-[var(--color-bg-tertiary)]">Select your Organization</option>
                  {organizations.map(org => (
                    <option key={org.id || org._id} value={org.id || org._id} className="bg-[var(--color-bg-tertiary)]">{org.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Password</label>
            <input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm" />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Confirm password</label>
            <input id="confirm-password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/50 transition-all duration-200 text-sm" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/20 disabled:opacity-50 text-sm mt-1"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Create account</span><ArrowRight size={16} /></>}
          </button>

          <div className="relative mt-5">
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

        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline font-medium">Sign in</Link>
        </p>
        </motion.div>
      </div>
    </div>
  );
}
