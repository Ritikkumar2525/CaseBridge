import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
const FeatureDetail = React.lazy(() => import('./pages/public/FeatureDetail'));

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AuthSuccess from './pages/auth/AuthSuccess';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OrgDashboard from './pages/dashboard/OrgDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';

// Complaint Pages
import ComplaintsList from './pages/complaints/ComplaintsList';
import ComplaintView from './pages/complaints/ComplaintView';
import NewComplaint from './pages/complaints/NewComplaint';

// Organization Pages
import OrganizationList from './pages/organizations/OrganizationList';
import OrganizationView from './pages/organizations/OrganizationView';

// User Pages
import UserList from './pages/users/UserList';

// Meeting Pages
import VideoMeeting from './pages/meetings/VideoMeeting';

// Other Pages
import NotificationsPage from './pages/NotificationsPage';
import NotFound from './pages/NotFound';

/**
 * Redirect to role-appropriate dashboard
 */
function DashboardRedirect() {
  const { user } = useAuth();
  const routes = {
    super_admin: '/admin/dashboard',
    org_admin: '/org/dashboard',
    staff: '/staff/dashboard',
    user: '/dashboard',
  };
  return <Navigate to={routes[user?.role] || '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/features/:id" 
              element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div></div>}>
                  <FeatureDetail />
                </Suspense>
              } 
            />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            {/* Dashboard redirect for authenticated users */}
            <Route path="/app" element={<DashboardRedirect />} />

            {/* Dashboards */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/org/dashboard" element={<OrgDashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />

            {/* Complaints */}
            <Route path="/complaints" element={<ComplaintsList />} />
            <Route path="/complaints/new" element={<NewComplaint />} />
            <Route path="/complaints/:id" element={<ComplaintView />} />

            {/* Organizations */}
            <Route path="/admin/organizations" element={<OrganizationList />} />
            <Route path="/admin/organizations/:id" element={<OrganizationView />} />

            {/* Users */}
            <Route path="/admin/users" element={<UserList />} />

            {/* Video Meetings */}
            <Route path="/meetings" element={<VideoMeeting />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GoogleOAuthProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
