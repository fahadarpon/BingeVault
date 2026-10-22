import React, { useRef, useState } from 'react';
import { 
  Plus, 
  BarChart3, 
  Download, 
  Upload, 
  RotateCcw, 
  MoreVertical,
  Share2,
  Check,
  Clapperboard,
  UserPlus,
  Compass,
  Bookmark
} from 'lucide-react';
import type { ViewMode } from '../types/media';
import type { UserProfile } from '../types/user';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  totalCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenStatsModal: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetData: () => void;
  onShare: () => void;
  copiedShareLink: boolean;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onOpenStatsModal,
  onExport,
  onImport,
  onResetData,
  onShare,
  copiedShareLink,
  currentUser,
  onOpenAuth,
  onSignOut,
  onGoHome,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand: BingeVault (Click to go Home) */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Return to BingeVault Home"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 shadow-lg shadow-purple-600/30 ring-1 ring-white/20 group-hover:shadow-purple-500/50 transition-shadow">
            <Clapperboard className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-200 transition-colors uppercase">
                Binge<span className="text-purple-400 group-hover:text-purple-300">Vault</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {totalCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              Cinema • Series • Anime • Games
            </p>
          </div>
        </div>

        {/* Trakt-Style Center Navigation */}
        <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            title="My Vault Library"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' || viewMode === 'list' || viewMode === 'kanban'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Vault</span>
          </button>

          <button
            onClick={() => onViewModeChange('discover')}
            title="Discover Live Feed"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'discover'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-purple-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          {/* Share Button */}
          <button
            onClick={onShare}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
              copiedShareLink
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-white/10'
            }`}
            title="Share your collection with friends"
          >
            {copiedShareLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
            <span className="hidden sm:inline">{copiedShareLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStatsModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl transition-all"
            title="View Library Analytics & Breakdown"
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Add Item Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          {/* Auth Button or User Menu */}
          {currentUser ? (
            <UserMenu
              user={currentUser}
              onSignOut={onSignOut}
              onOpenAuth={onOpenAuth}
              totalItems={totalCount}
            />
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 rounded-xl transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          )}

          {/* More / Backup Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/10 rounded-xl transition-all"
              title="Backup, export, import data"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 text-xs backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onExport();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export JSON Backup</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Import JSON Backup</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onResetData();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Sample Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

      </div>
    </header>
  );
};
