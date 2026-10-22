import type { UserProfile } from '../types/user';
import type { MediaItem } from '../types/media';
import { INITIAL_ITEMS } from '../data/sampleData';

const USERS_DB_KEY = 'bingevault_users_db_v1';
const CURRENT_SESSION_KEY = 'bingevault_current_session_v1';

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
];

interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

function getAllStoredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUserSession(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export async function signUpUser(
  username: string,
  email: string,
  password: string,
  avatarUrl?: string,
  guestItems?: MediaItem[]
): Promise<UserProfile> {
  const users = getAllStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    throw new Error('This username is already taken. Please choose another.');
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser: StoredUserAccount = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    avatarUrl: avatarUrl || AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
    createdAt: new Date().toISOString(),
    passwordHash: btoa(password), // simple client hashing for local storage
  };

  users.push(newUser);
  saveStoredUsers(users);

  // Initialize user's items library (either migrate current guest items or load starter items)
  const initialItems = guestItems && guestItems.length > 0 ? guestItems : INITIAL_ITEMS;
  saveUserMedia(userId, initialItems);

  // Set active session
  const profile: UserProfile = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
    createdAt: newUser.createdAt,
  };

  setCurrentUserSession(profile);
  return profile;
}

export async function signInUser(emailOrUsername: string, password: string): Promise<UserProfile> {
  const users = getAllStoredUsers();
  const query = emailOrUsername.trim().toLowerCase();

  const user = users.find(
    (u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
  );

  if (!user) {
    throw new Error('No account found with this email or username.');
  }

  if (user.passwordHash !== btoa(password)) {
    throw new Error('Incorrect password. Please try again.');
  }

  const profile: UserProfile = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };

  setCurrentUserSession(profile);
  return profile;
}

export function signOutUser(): void {
  setCurrentUserSession(null);
}

// User-specific media storage
export function getUserMedia(userId: string): MediaItem[] {
  try {
    const raw = localStorage.getItem(`bingevault_user_${userId}_items`);
    if (raw) {
      return JSON.parse(raw);
    }
    return INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveUserMedia(userId: string, items: MediaItem[]): void {
  try {
    localStorage.setItem(`bingevault_user_${userId}_items`, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save user media:', e);
  }
}
