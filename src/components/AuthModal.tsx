import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  AlertCircle,
  Upload,
  Link,
  Camera
} from 'lucide-react';
import type { UserProfile } from '../types/user';
import type { MediaItem } from '../types/media';
import { signInUser, signUpUser, AVATAR_PRESETS } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  guestItemsCount: number;
  guestItems: MediaItem[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guestItemsCount,
  guestItems,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [migrateGuestItems, setMigrateGuestItems] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedAvatar(base64);
        setAvatarMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customAvatarUrl.trim()) {
      setSelectedAvatar(customAvatarUrl.trim());
      setAvatarMode('url');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 4) {
          throw new Error('Password must be at least 4 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!username.trim() || !email.trim()) {
          throw new Error('Please fill in all required fields.');
        }

        const user = await signUpUser(
          username,
          email,
          password,
          selectedAvatar,
          migrateGuestItems ? guestItems : undefined
        );
        onSuccess(user);
        onClose();
      } else {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email/username and password.');
        }
        const user = await signInUser(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Switcher Tabs */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {mode === 'signup' ? 'Create BingeVault Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'signup' 
                    ? 'Save your watchlists, track progress & sync' 
                    : 'Log in to access your saved library'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'signup'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'signin'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign Up Fields */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g., MediaMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Email / Username field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {mode === 'signup' ? 'Email Address' : 'Email or Username'} <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={mode === 'signup' ? 'email' : 'text'}
                required
                placeholder={mode === 'signup' ? 'alex@example.com' : 'Your email or username'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Confirm Password (only on signup) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* CUSTOM AVATAR OPTIONS (only on signup) */}
          {mode === 'signup' && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Profile Avatar
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAvatarMode('preset')}
                    className={`px-2 py-0.5 rounded ${avatarMode === 'preset' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMode('upload');
                      fileInputRef.current?.click();
                    }}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${avatarMode === 'upload' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode('url')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${avatarMode === 'url' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Link className="w-2.5 h-2.5" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {/* Avatar Preview & Choice */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 ring-2 ring-purple-500/30 flex-shrink-0 bg-slate-900">
                  <img src={selectedAvatar} alt="preview" className="w-full h-full object-cover" />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change Avatar"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {avatarMode === 'preset' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {AVATAR_PRESETS.map((av, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedAvatar(av)}
                          className={`w-8 h-8 rounded-full overflow-hidden cursor-pointer border transition-all flex-shrink-0 ${
                            selectedAvatar === av 
                              ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105' 
                              : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {avatarMode === 'upload' && (
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-xl text-xs text-purple-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo From Device</span>
                      </button>
                    </div>
                  )}

                  {avatarMode === 'url' && (
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Paste image link https://..."
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Set
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Migration Checkbox */}
          {mode === 'signup' && guestItemsCount > 0 && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={migrateGuestItems}
                onChange={(e) => setMigrateGuestItems(e.target.checked)}
                className="mt-0.5 rounded accent-purple-600 cursor-pointer"
              />
              <span className="text-xs text-slate-300">
                Import my current guest collection (<strong>{guestItemsCount}</strong> titles) into this new account.
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
          </button>

          {/* Switch Mode footer */}
          <div className="text-center text-xs text-slate-400 pt-2">
            {mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-purple-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-purple-400 hover:underline font-semibold"
                >
                  Create one for free
                </button>
              </span>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
