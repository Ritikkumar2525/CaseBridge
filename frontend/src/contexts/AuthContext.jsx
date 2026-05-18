import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('casebridge_token');
    const savedUser = localStorage.getItem('casebridge_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authAPI.me().then(res => {
          setUser(res.data.data);
          localStorage.setItem('casebridge_user', JSON.stringify(res.data.data));
        }).catch(() => {
          logout();
        }).finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await authAPI.login(email, password, role);
    const { user: userData, token } = res.data.data;
    localStorage.setItem('casebridge_token', token.access_token);
    localStorage.setItem('casebridge_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    await authAPI.register(data);
    // Manual login required per new flow, so we do not save the token immediately.
    return true;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch { /* ignore */ }
    localStorage.removeItem('casebridge_token');
    localStorage.removeItem('casebridge_user');
    setUser(null);
  };

  const googleLogin = async (credential, role) => {
    const res = await authAPI.googleLogin(credential, role);
    const { user: userData, token } = res.data.data;
    localStorage.setItem('casebridge_token', token.access_token);
    localStorage.setItem('casebridge_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const forgotPassword = async (email) => {
    return await authAPI.forgotPassword(email);
  };

  const resetPasswordWithOtp = async (data) => {
    return await authAPI.resetPasswordOtp(data);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    googleLogin,
    forgotPassword,
    resetPasswordWithOtp,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isOrgAdmin: user?.role === 'org_admin',
    isStaff: user?.role === 'staff',
    isUser: user?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
