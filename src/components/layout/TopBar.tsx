import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/customers': 'Customers',
  '/deals': 'Deals',
  '/activities': 'Activities',
  '/users': 'Users',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const title = pageTitles[location.pathname] ?? 'CRM SaaS';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Welcome back, {user?.firstName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500">
          <span className="text-white text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}