import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api';
import { Loader2 } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token provided.');
      return;
    }
    
    // 1. Save token in localStorage
    localStorage.setItem('casebridge_token', token);
    
    // 2. Fetch authenticated user profile
    authAPI.me()
      .then(res => {
        const userData = res.data.data;
        // 3. Save user in localStorage
        localStorage.setItem('casebridge_user', JSON.stringify(userData));
        
        // 4. Redirect to /app which handles role-appropriate routing
        window.location.href = '/app';
      })
      .catch(err => {
        localStorage.removeItem('casebridge_token');
        setError('Authentication failed. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-primary)] p-4">
      {error ? (
        <div className="text-center max-w-sm">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-all font-semibold"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Completing secure sign-in...</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Please wait while we establish your session</p>
        </div>
      )}
    </div>
  );
}
