import React, { useState } from 'react';
import { LogOut, User, Sparkles, ChevronDown } from 'lucide-react';
import type { UserProfile } from '../types/user';

interface UserMenuProps {
  user: UserProfile;
  onSignOut: () => void;
  onOpenAuth: () => void;
  totalItems: number;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onSignOut,
  onOpenAuth,
  totalItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all group"
      >
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-purple-500/40">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold text-xs">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
        </div>
        <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 max-w-[100px] truncate hidden sm:inline">
          {user.username}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs">
            {/* User Info Header */}
            <div className="p-2.5 border-b border-slate-800/80 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/40 flex-shrink-0">
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-100 truncate">{user.username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/50">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{totalItems} Titles Logged</span>
                </span>
                <span>Active</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>Switch / Add Account</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
