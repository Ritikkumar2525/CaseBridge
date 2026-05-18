import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, FileText, Building2, Users, Bell, Video,
  LogOut, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout, isSuperAdmin, isOrgAdmin, isStaff } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-based navigation items
  const navItems = [];

  // Dashboard — everyone gets one
  if (isSuperAdmin) {
    navItems.push({ to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  } else if (isOrgAdmin) {
    navItems.push({ to: '/org/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  } else if (isStaff) {
    navItems.push({ to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  } else {
    navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  }

  // Complaints — everyone
  navItems.push({ to: '/complaints', icon: FileText, label: 'Complaints' });

  // Organizations — super admin only
  if (isSuperAdmin) {
    navItems.push({ to: '/admin/organizations', icon: Building2, label: 'Organizations' });
    navItems.push({ to: '/admin/users', icon: Users, label: 'Users' });
  }

  // User management — org admin
  if (isOrgAdmin) {
    navItems.push({ to: '/admin/users', icon: Users, label: 'Staff & Users' });
  }

  // Video Meetings — admin & org admin
  if (isSuperAdmin || isOrgAdmin) {
    navItems.push({ to: '/meetings', icon: Video, label: 'Meetings' });
  }

  // Notifications — everyone
  navItems.push({ to: '/notifications', icon: Bell, label: 'Notifications' });

  const linkClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/20'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
    }`;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CaseBridge</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-500 flex items-center justify-center mx-auto">
            <Layers size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => linkClasses(isActive)}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle & User Info & Logout */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] ${
            collapsed ? 'justify-center' : ''
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {/* Custom Toggle Switch */}
          <div className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 flex-shrink-0 ${
            isDark ? 'bg-[var(--color-bg-hover)] border border-[var(--color-border)]' : 'bg-[var(--color-accent)] border border-[var(--color-accent)]'
          }`}>
            <div className={`absolute top-[2px] w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${
              isDark ? 'left-[2px] bg-[var(--color-text-muted)]' : 'left-[22px] bg-white'
            }`} />
          </div>
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && (
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] uppercase tracking-wider">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
