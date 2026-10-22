import { useState, useEffect, useMemo } from 'react';
import type { 
  MediaItem, 
  MediaType, 
  MediaStatus, 
  ViewMode, 
  SortOption 
} from './types/media';
import type { UserProfile } from './types/user';
import { loadMediaItems, saveMediaItems, exportBackup, importBackup } from './utils/storage';
import { getCurrentUser, signOutUser, getUserMedia, saveUserMedia } from './utils/auth';
import { INITIAL_ITEMS } from './data/sampleData';
import { fireCelebrationConfetti } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { TraktHero } from './components/TraktHero';
import { UpNextSection } from './components/UpNextSection';
import { FilterBar } from './components/FilterBar';
import { MediaCard } from './components/MediaCard';
import { MediaListItem } from './components/MediaListItem';
import { KanbanView } from './components/KanbanView';
import { DiscoverView } from './components/DiscoverView';
import { MediaModal } from './components/MediaModal';
import { StatsModal } from './components/StatsModal';
import { AuthModal } from './components/AuthModal';
import { Plus, FolderX, Sparkles, X, Compass, LayoutGrid, List, Kanban } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());

  // Load items for active user or guest
  const [items, setItems] = useState<MediaItem[]>(() => {
    const user = getCurrentUser();
    return user ? getUserMedia(user.id) : loadMediaItems();
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filters & Sorting state
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dynamic Share state
  const [sharedImportItems, setSharedImportItems] = useState<MediaItem[] | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Persist items whenever items change (to user's space or guest space)
  useEffect(() => {
    if (currentUser) {
      saveUserMedia(currentUser.id, items);
    } else {
      saveMediaItems(items);
    }
  }, [items, currentUser]);

  // Handle switching users / sign in / sign out
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    const userItems = getUserMedia(user.id);
    setItems(userItems);
    fireCelebrationConfetti();
  };

  const handleSignOut = () => {
    signOutUser();
    setCurrentUser(null);
    setItems(loadMediaItems());
  };

  const handleGoHome = () => {
    setViewMode('grid');
    setSelectedType('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSelectedGenre('');
    setFavoritesOnly(false);
    if (window.location.hash) {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check URL hash for shared collection link
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const encoded = hash.replace('#share=', '');
        const decodedJson = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
        const parsed = JSON.parse(decodedJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSharedImportItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse shared link data:', e);
    }
  }, []);

  // Compute available genres dynamically
  const availableGenres = useMemo(() => {
    const relevantItems = selectedType === 'all' 
      ? items 
      : items.filter(i => i.type === selectedType);
    
    const set = new Set<string>();
    relevantItems.forEach(i => {
      (i.genres || []).forEach(g => set.add(g));
    });
    return Array.from(set).sort();
  }, [items, selectedType]);

  // Filter & Sort items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (favoritesOnly && !item.favorite) return false;
      if (selectedGenre && (!item.genres || !item.genres.includes(selectedGenre))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesGenre = item.genres?.some(g => g.toLowerCase().includes(q));
        
        let matchesExtra = false;
        if (item.type === 'game' && item.platform?.toLowerCase().includes(q)) matchesExtra = true;
        if (item.type === 'anime' && item.studio?.toLowerCase().includes(q)) matchesExtra = true;
        if (item.type === 'series' && item.network?.toLowerCase().includes(q)) matchesExtra = true;
        if (item.type === 'movie' && item.director?.toLowerCase().includes(q)) matchesExtra = true;

        if (!matchesTitle && !matchesNotes && !matchesGenre && !matchesExtra) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'year_desc':
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case 'progress_desc': {
          const getProgressVal = (item: MediaItem) => {
            if (item.type === 'game') return item.hoursPlayed || 0;
            if (item.type === 'anime' || item.type === 'series') return item.currentEpisode || 0;
            return item.status === 'completed' ? 100 : 0;
          };
          return getProgressVal(b) - getProgressVal(a);
        }
        case 'updated_desc':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });
  }, [items, selectedType, selectedStatus, favoritesOnly, selectedGenre, searchQuery, sortBy]);

  // Handlers
  const handleSaveItem = (itemToSave: MediaItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === itemToSave.id);
      if (exists) {
        return prev.map((i) => (i.id === itemToSave.id ? itemToSave : i));
      } else {
        return [itemToSave, ...prev];
      }
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this title?')) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, favorite: !i.favorite, updatedAt: new Date().toISOString() } : i))
    );
  };

  const handleQuickStatusChange = (item: MediaItem, newStatus: MediaStatus) => {
    if (newStatus === 'completed') {
      fireCelebrationConfetti();
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date().toISOString().slice(0, 10) : i.completedDate,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
  };

  const handleIncrementProgress = (item: MediaItem, amount = 1) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;

        const now = new Date().toISOString();

        if (i.type === 'anime' || i.type === 'series') {
          const nextEp = (i.currentEpisode || 0) + amount;
          const isDone = i.totalEpisodes && nextEp >= i.totalEpisodes;
          if (isDone) {
            fireCelebrationConfetti();
          }
          return {
            ...i,
            currentEpisode: nextEp,
            status: isDone ? 'completed' : i.status === 'plan_to_watch' ? 'in_progress' : i.status,
            completedDate: isDone ? now.slice(0, 10) : i.completedDate,
            updatedAt: now,
          };
        }

        if (i.type === 'game') {
          const nextHours = (i.hoursPlayed || 0) + amount;
          return {
            ...i,
            hoursPlayed: nextHours,
            status: i.status === 'plan_to_watch' ? 'in_progress' : i.status,
            updatedAt: now,
          };
        }

        if (i.type === 'movie') {
          return {
            ...i,
            rewatchCount: (i.rewatchCount || 0) + amount,
            updatedAt: now,
          };
        }

        return i;
      })
    );
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importBackup(file);
      setItems(imported);
      alert(`Successfully imported ${imported.length} items!`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all items back to starter sample data?')) {
      setItems(INITIAL_ITEMS);
    }
  };

  const handleShare = () => {
    try {
      const json = JSON.stringify(items);
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
      exportBackup(items);
    }
  };

  const handleAcceptSharedImport = (merge: boolean) => {
    if (!sharedImportItems) return;
    if (merge) {
      const existingIds = new Set(items.map(i => i.id));
      const newItems = sharedImportItems.filter(i => !existingIds.has(i.id));
      setItems([...newItems, ...items]);
    } else {
      setItems(sharedImportItems);
    }
    setSharedImportItems(null);
    window.location.hash = '';
    fireCelebrationConfetti();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* Shared Link Import Notification Banner */}
      {sharedImportItems && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border-b border-purple-500/40 px-4 py-3 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg z-50">
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              You opened a shared <strong>BingeVault</strong> library with <strong>{sharedImportItems.length}</strong> titles!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptSharedImport(false)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Replace Current Library
            </button>
            <button
              onClick={() => handleAcceptSharedImport(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              Merge With Mine
            </button>
            <button
              onClick={() => {
                setSharedImportItems(null);
                window.location.hash = '';
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        totalCount={items.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={handleOpenAdd}
        onOpenStatsModal={() => setIsStatsOpen(true)}
        onExport={() => exportBackup(items)}
        onImport={handleImport}
        onResetData={handleResetData}
        onShare={handleShare}
        copiedShareLink={copiedShareLink}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onGoHome={handleGoHome}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Render Discover View or Trakt-Style Dashboard */}
        {viewMode === 'discover' ? (
          <DiscoverView
            onAddMedia={handleSaveItem}
            existingItems={items}
          />
        ) : (
          <>
            {/* Trakt-Style Spotlight Hero Banner (only in default all view with items) */}
            {selectedType === 'all' && selectedStatus === 'all' && !searchQuery && !selectedGenre && !favoritesOnly && (
              <TraktHero
                items={items}
                onEdit={handleOpenEdit}
                onIncrementProgress={handleIncrementProgress}
                onQuickStatusChange={handleQuickStatusChange}
              />
            )}

            {/* Trakt-Style "Up Next" Row for Active In-Progress Titles */}
            {selectedType === 'all' && selectedStatus === 'all' && !searchQuery && !selectedGenre && !favoritesOnly && (
              <UpNextSection
                items={items}
                onEdit={handleOpenEdit}
                onIncrementProgress={handleIncrementProgress}
                onQuickStatusChange={handleQuickStatusChange}
                onGoToDiscover={() => setViewMode('discover')}
              />
            )}

            {/* Library Section Header with View Mode Switchers */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span>My Media Library</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
                    {filteredItems.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Filter, sort, and manage your tracked titles</p>
              </div>

              {/* View Mode Switcher buttons */}
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Cards Grid"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="Compact List"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  title="Kanban Board"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Category Controls */}
            <FilterBar
              items={items}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favoritesOnly={favoritesOnly}
              onToggleFavoritesOnly={() => setFavoritesOnly(!favoritesOnly)}
              availableGenres={availableGenres}
            />

            {/* Content Views */}
            {filteredItems.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
                <div className="p-4 rounded-2xl bg-slate-800/60 text-slate-500 mb-3">
                  <FolderX className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No media found</h3>
                <p className="text-sm text-slate-400 max-w-md mt-1 mb-5">
                  {searchQuery || selectedGenre || favoritesOnly || selectedStatus !== 'all'
                    ? 'Try clearing some filters or searching for something else.'
                    : 'Your backlog is currently empty. Start logging movies, series, anime, and games!'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Item</span>
                  </button>
                  <button
                    onClick={() => setViewMode('discover')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                  >
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Explore Discover</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View with 2:3 Cinema Posters */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {filteredItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteItem}
                    onToggleFavorite={handleToggleFavorite}
                    onIncrementProgress={handleIncrementProgress}
                    onQuickStatusChange={handleQuickStatusChange}
                  />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <MediaListItem
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteItem}
                    onToggleFavorite={handleToggleFavorite}
                    onIncrementProgress={handleIncrementProgress}
                    onQuickStatusChange={handleQuickStatusChange}
                  />
                ))}
              </div>
            ) : (
              /* Kanban Board View */
              <KanbanView
                items={filteredItems}
                onEdit={handleOpenEdit}
                onIncrementProgress={handleIncrementProgress}
                onStatusChange={handleQuickStatusChange}
              />
            )}
          </>
        )}

      </main>

      {/* Add / Edit Dialog */}
      <MediaModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />

      {/* Analytics Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        items={items}
      />

      {/* Auth / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        guestItemsCount={items.length}
        guestItems={items}
      />

    </div>
  );
}

export default App;
