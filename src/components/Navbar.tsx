import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, User, Sparkles, Search, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Search, label: 'Discover' },
    { to: '/matches', icon: MessageSquare, label: 'Matches' },
    { to: '/premium', icon: Sparkles, label: 'Premium' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
