import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  UserCog,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Leads',
    path: '/leads',
    icon: <Users size={18} />,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: <UserCheck size={18} />,
  },
  {
    label: 'Deals',
    path: '/deals',
    icon: <TrendingUp size={18} />,
  },
  {
    label: 'Activities',
    path: '/activities',
    icon: <Calendar size={18} />,
  },
  {
    label: 'Users',
    path: '/users',
    icon: <UserCog size={18} />,
    roles: ['ORG_ADMIN', 'SALES_MANAGER'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings size={18} />,
    roles: ['ORG_ADMIN'],
  },
];

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role as UserRole);
  });

  return (
    <aside className="flex flex-col w-64 h-full bg-slate-900 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500">
          <Building2 size={16} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          CRM SaaS
        </span>
      </div>

      {/* Organization name */}
      <div className="px-6 py-3 border-b border-slate-800">
        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">
          Organization
        </p>
        <p className="text-slate-200 text-sm font-medium mt-0.5 truncate">
          {user?.firstName}'s Workspace
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors duration-150"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}