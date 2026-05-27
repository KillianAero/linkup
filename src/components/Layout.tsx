import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { LayoutDashboard, Users, UserPlus, LogOut } from 'lucide-react';

type Page = 'dashboard' | 'contacts' | 'add';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User;
  onSignOut: () => void;
  loading?: boolean;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Accueil', Icon: LayoutDashboard },
  { id: 'contacts' as Page, label: 'Contacts', Icon: Users },
  { id: 'add' as Page, label: 'Ajouter', Icon: UserPlus },
];

export function Layout({ children, currentPage, onNavigate, user, onSignOut, loading }: LayoutProps) {
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '';
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || '?';

  return (
    <div className="flex flex-col min-h-dvh bg-[#f5f3ff]">
      {/* Top header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-violet-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">LU</span>
          </div>
          <span className="font-semibold text-violet-900 text-lg tracking-tight">LinkUP</span>
        </div>
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-xs font-bold">
              {initials}
            </div>
          )}
          <button
            onClick={onSignOut}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center pt-24">
            <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-violet-100">
        <div className="flex items-stretch max-w-lg mx-auto">
          {navItems.map(({ id, label, Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-colors ${
                  active ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[11px] font-medium ${active ? 'text-violet-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-violet-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
