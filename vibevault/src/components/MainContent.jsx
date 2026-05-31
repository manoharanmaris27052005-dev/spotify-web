import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Heart, Trash2, Plus, Music, Search, 
  Volume2, Clock, Calendar, AlertCircle, PlusCircle, Check, Sparkles, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

const MainContent = ({
  activeView,
  setActiveView,
  songs,
  playlists,
  recentTracks,
  favorites,
  activeSong,
  isPlaying,
  onSongSelect,
  onTogglePlay,
  onToggleFavorite,
  onAddSongToPlaylist,
  onRemoveSongFromPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onDeleteSong,
  selectedPlaylistId,
  addToast,
  setMobileMenuOpen // Accept toggle trigger for mobile drawer sidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlaylistMenuId, setShowPlaylistMenuId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // JioSaavn API Search state
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const searchDebounce = useRef(null);

  // Filter local songs based on search
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch from JioSaavn API
  const fetchFromSaavn = useCallback(async (query) => {
    if (!query.trim()) {
      setApiResults([]);
      setApiError(null);
      return;
    }
    setApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      if (data.success && data.data && data.data.results) {
        setApiResults(data.data.results);
      } else {
        setApiResults([]);
      }
    } catch (err) {
      setApiError('Could not connect to search. Check your internet.');
      setApiResults([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (activeView !== 'search') return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      fetchFromSaavn(searchQuery);
    }, 500);
    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery, activeView, fetchFromSaavn]);

  const handlePlaylistCreateSubmit = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  };

  // Get selected custom playlist detail
  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const playlistSongs = currentPlaylist 
    ? songs.filter(s => currentPlaylist.songIds.includes(s.id))
    : [];

  return (
    <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 pb-40 scroll-smooth">
      
      {/* 1. Header Navigation Bar inside Content */}
      <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md flex items-center justify-between mb-8 pb-4 pt-2 -mt-4 shadow-sm">
        
        {/* Navigation Arrows & Hamburger */}
        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-[#b3b3b3] hover:text-white cursor-not-allowed opacity-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-[#b3b3b3] hover:text-white cursor-not-allowed opacity-50">
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-full bg-black text-[#b3b3b3] hover:text-white md:hidden"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right side Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 rounded-full bg-black border border-[#282828] flex items-center justify-center text-[#b3b3b3] hover:text-white cursor-pointer hover:scale-105 transition-transform" title="User Profile">
            <span className="text-xs md:text-sm font-bold">V</span>
          </div>
        </div>

      </header>

      {/* ========================================== */}
      {/* VIEW PANEL RENDER ROUTER */}
      {/* ========================================== */}

      {/* A. HOME VIEW */}
      {activeView === 'home' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-200">
          
          {/* Welcome Interactive glass banner */}
          <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-br from-cyber-purple/20 via-cyber-purple/5 to-cyber-green/15 border border-white/5 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 neon-glow-green -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 neon-glow-purple -ml-20 -mb-20 pointer-events-none" />
            
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Fully Offline Vault Active
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-tight md:leading-none">
                Take control of your listening experience.
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
                Drag and drop your personal audio files into the vault. We'll store them securely directly in your browser's local store. Uncompromised privacy, zero ads, zero bandwidth cost.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveView('library')}
                  className="px-5 py-3 md:px-6 md:py-3 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-[10px] md:text-xs font-extrabold uppercase tracking-widest border border-transparent transition-all hover:scale-[1.03] active:scale-95 duration-200 shadow-md"
                >
                  Browse Library
                </button>
              </div>
            </div>
          </div>

          {/* Recently Played Dashboard Row */}
          {recentTracks.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase mb-4">Recently played</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {songs.filter(s => recentTracks.includes(s.id)).slice(0, 4).map((song) => (
                  <div 
                    key={song.id}
                    onClick={() => onSongSelect(song, songs)}
                    className="p-3 md:p-4 rounded-2xl glass-card flex flex-col gap-3 cursor-pointer group"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/5 shadow-md">
                      {song.cover ? (
                        <img src={song.cover} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-cyber-purple/20 to-cyber-green/10 flex items-center justify-center text-cyber-purple">
                          <Music className="w-8 h-8" />
                        </div>
                      )}
                      
                      {/* Interactive hover play button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <button 
                          className="w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] active:scale-95 shadow-[0_8px_8px_rgba(0,0,0,0.3)] duration-150"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeSong?.id === song.id) {
                              onTogglePlay();
                            } else {
                              onSongSelect(song, songs);
                            }
                          }}
                        >
                          {activeSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-100 truncate group-hover:text-cyber-green transition-colors">{song.title}</span>
                      <span className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic statistics overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl glass-panel flex flex-col gap-2 relative overflow-hidden border border-white/5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Total songs saved</span>
              <span className="text-3xl md:text-4xl font-black text-white">{songs.length}</span>
              <div className="absolute bottom-2 right-2 text-cyber-green opacity-15"><Music className="w-16 h-16" /></div>
            </div>

            <div className="p-5 rounded-2xl glass-panel flex flex-col gap-2 relative overflow-hidden border border-white/5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Favorites collections</span>
              <span className="text-3xl md:text-4xl font-black text-red-500">{favorites.length}</span>
              <div className="absolute bottom-2 right-2 text-red-500 opacity-15"><Heart className="w-16 h-16" /></div>
            </div>

            <div className="p-5 rounded-2xl glass-panel flex flex-col gap-2 relative overflow-hidden border border-white/5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Playlists compiled</span>
              <span className="text-3xl md:text-4xl font-black text-cyber-purple">{playlists.length}</span>
              <div className="absolute bottom-2 right-2 text-cyber-purple opacity-15"><PlusCircle className="w-16 h-16" /></div>
            </div>

          </div>

        </div>
      )}

      {/* B. SEARCH VIEW */}
      {activeView === 'search' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Search Header */}
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Search</h2>
            <p className="text-sm text-slate-500">Search millions of songs from JioSaavn</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/8 border border-white/10 focus:border-[#1DB954]/60 outline-none text-slate-100 placeholder-slate-500 text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] focus:shadow-[0_0_30px_rgba(29,185,84,0.12)] focus:bg-white/10"
            />
            {apiLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#1DB954]/40 border-t-[#1DB954] rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Results */}
          {!searchQuery ? (
            /* Browse Category Cards if Search is Empty */
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase mb-4">Browse categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[['Tamil', 'from-rose-600 to-red-900', 'Tamil'], ['Hindi', 'from-orange-500 to-amber-800', 'Hindi'], ['Melody', 'from-purple-600 to-indigo-900', 'Melody'], ['Beats', 'from-emerald-600 to-teal-900', 'Beats'], ['Lofi', 'from-blue-600 to-cyan-900', 'Lofi'], ['Anirudh', 'from-pink-600 to-rose-900', 'Anirudh'], ['ARR', 'from-yellow-500 to-orange-800', 'A.R. Rahman'], ['Trending', 'from-violet-600 to-purple-900', 'Trending']].map(([query, gradient, label]) => (
                  <button
                    key={query}
                    onClick={() => setSearchQuery(query)}
                    className={`h-28 md:h-32 rounded-2xl p-4 md:p-5 bg-gradient-to-br ${gradient} border border-white/5 relative overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all text-left w-full`}
                  >
                    <h4 className="font-black text-lg md:text-xl text-white">{label}</h4>
                    <Music className="w-16 h-16 absolute right-0 bottom-0 rotate-12 text-white/10 translate-y-3 translate-x-3 group-hover:scale-110 duration-200" />
                  </button>
                ))}
              </div>
            </div>
          ) : apiError ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-center">
              <AlertCircle className="w-12 h-12 mb-3 text-red-500" />
              <h4 className="font-bold text-slate-400">{apiError}</h4>
            </div>
          ) : apiLoading && apiResults.length === 0 ? (
            /* Loading Skeleton */
            <div className="flex flex-col gap-2 mt-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl">
                  <div className="w-10 h-10 rounded-lg skeleton-shimmer flex-shrink-0"></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-48 rounded skeleton-shimmer"></div>
                    <div className="h-2 w-32 rounded skeleton-shimmer"></div>
                  </div>
                  <div className="h-2 w-10 rounded skeleton-shimmer"></div>
                </div>
              ))}
            </div>
          ) : apiResults.length > 0 ? (
            <div>
              <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase mb-4">Results for "{searchQuery}" ({apiResults.length})</h3>
              <div className="flex flex-col gap-1">
                {apiResults.map((song, index) => {
                  const cover = song.image?.find(i => i.quality === '150x150')?.url || song.image?.[1]?.url || '';
                  const artists = song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist';
                  const bestUrl = song.downloadUrl?.find(d => d.quality === '160kbps')?.url ||
                                  song.downloadUrl?.find(d => d.quality === '96kbps')?.url ||
                                  song.downloadUrl?.[song.downloadUrl.length - 1]?.url || '';
                  const duration = song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,'0')}` : '--:--';
                  const isActive = activeSong?.src === bestUrl;

                  return (
                    <button
                      key={song.id}
                      onClick={() => onSongSelect({
                        id: `saavn_${song.id}`,
                        title: song.name,
                        artist: artists,
                        album: song.album?.name || 'JioSaavn',
                        src: bestUrl,
                        cover: cover,
                        duration: duration,
                        file: null
                      })}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-left w-full group transition-all duration-150 ${
                        isActive 
                          ? 'bg-[#1DB954]/10 border border-[#1DB954]/20' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {/* Index / Play icon */}
                      <div className="w-6 text-center flex-shrink-0">
                        {isActive && isPlaying ? (
                          <div className="flex items-end justify-center gap-[2px] h-4">
                            {[1,2,3].map(b => (
                              <div key={b} className="w-[3px] bg-[#1DB954] rounded-sm animate-bounce" style={{animationDelay: `${b*0.1}s`, height: `${8+b*4}px`}}></div>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-xs font-semibold group-hover:hidden ${isActive ? 'text-[#1DB954]' : 'text-slate-500'}`}>{index + 1}</span>
                        )}
                        <Play className={`w-4 h-4 text-white hidden group-hover:block ${isActive && isPlaying ? '!hidden' : ''}`} />
                      </div>

                      {/* Album art */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#282828]">
                        {cover ? (
                          <img src={cover} alt={song.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Music className="w-4 h-4 text-slate-600" /></div>
                        )}
                      </div>

                      {/* Song info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isActive ? 'text-[#1DB954]' : 'text-slate-200'}`}>{song.name}</p>
                        <p className="text-xs text-slate-500 truncate">{artists}</p>
                      </div>

                      {/* Album */}
                      <p className="text-xs text-slate-600 truncate hidden md:block max-w-[120px]">{song.album?.name || ''}</p>

                      {/* Duration */}
                      <span className="text-xs text-slate-500 flex-shrink-0 font-mono">{duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : searchQuery && !apiLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 text-center">
              <AlertCircle className="w-12 h-12 mb-3 text-slate-600" />
              <h4 className="font-bold text-slate-400">No results found for "{searchQuery}"</h4>
              <p className="text-sm mt-1">Try a different search term.</p>
            </div>
          ) : null}

        </div>
      )}

      {/* C. LIBRARY VIEW (UPLOAD & CATALOGS) */}
      {activeView === 'library' && (
        <div className="flex flex-col gap-10 animate-in fade-in duration-200">
          


          {/* Uploaded tracks list */}
          <div>
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase mb-4">Your tracks database ({songs.length})</h3>
            
            {songs.length > 0 ? (
              renderSongsTable(songs)
            ) : (
              /* Premium Empty State */
              <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-2">
                  <Music className="w-8 h-8" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-200">No tracks stored offline yet</h4>
                <p className="text-xs md:text-sm text-slate-400">
                  Your offline library is currently empty.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* D. FAVORITES SONGS VIEW */}
      {activeView === 'favorites' && (
        <div className="animate-in fade-in duration-200">
          {favorites.length > 0 ? (
            renderSongsTable(songs.filter(s => favorites.includes(s.id)), 'favorites')
          ) : (
            <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-base md:text-lg font-bold text-slate-200">Your favorite tracks is empty</h4>
              <p className="text-xs md:text-sm text-slate-400">
                Liking or saving songs inside track lists across the database automatically indexes them inside this panel for instant single-click plays.
              </p>
            </div>
          )}
        </div>
      )}

      {/* E. DYNAMIC CUSTOM PLAYLIST VIEW */}
      {activeView === 'playlist-details' && currentPlaylist && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Action header section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (playlistSongs.length > 0) {
                  onSongSelect(playlistSongs[0], playlistSongs);
                }
              }}
              disabled={playlistSongs.length === 0}
              className="px-5 py-2.5 md:px-6 md:py-3 rounded-2xl bg-cyber-green text-cyber-dark text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 duration-100 shadow-[0_0_20px_#10B981] disabled:opacity-50"
            >
              Play All
            </button>
            <button
              onClick={() => onDeletePlaylist(currentPlaylist.id)}
              className="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-150 hover:scale-[1.02] active:scale-95"
            >
              Delete Playlist
            </button>
          </div>

          {/* List display */}
          <div className="mt-4">
            {playlistSongs.length > 0 ? (
              renderSongsTable(playlistSongs, `playlist-${currentPlaylist.id}`)
            ) : (
              <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-2">
                  <Music className="w-8 h-8" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-200">Empty playlist catalog</h4>
                <p className="text-xs md:text-sm text-slate-400">
                  Navigate to your offline **Library** and select `+` icon or drop options on any song rows to index them inside this playlist.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* PLAYLIST CREATION DYNAMIC SIDE PANEL */}
      {/* ========================================== */}
      {activeView === 'library' && (
        <div className="mt-12 max-w-xl bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyber-purple animate-pulse" />
              <span>Create custom playlist</span>
            </h4>
          </div>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-3.5 border border-dashed border-white/10 hover:border-cyber-purple/35 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98"
            >
              <Plus className="w-5 h-5" /> Compile a new collection
            </button>
          ) : (
            <form onSubmit={handlePlaylistCreateSubmit} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="E.g., Cyber Lofi Focus, Night Drive..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyber-purple/50 outline-none text-sm text-white placeholder-slate-500 transition-colors"
                maxLength="40"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyber-purple hover:bg-cyber-purple/80 text-white font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-95"
              >
                Create
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );

  // ==========================================
  // MASTER SONGS TABLE COMPONENT RENDERER
  // ==========================================
  function renderSongsTable(songsList, contextName = 'library') {
    return (
      <div className="flex flex-col gap-1 w-full bg-white/[0.01] border border-white/5 rounded-3xl p-2 md:p-4 shadow-inner overflow-hidden">
        
        {/* Table Header columns - Adaptive grids based on viewports */}
        <div className="grid grid-cols-[40px_1fr_50px] sm:grid-cols-[40px_2fr_1fr_50px] md:grid-cols-[48px_4fr_3fr_1fr_60px] px-3 md:px-4 py-3 border-b border-white/5 text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 items-center">
          <div className="text-center">#</div>
          <div>Title / Artist</div>
          <div className="hidden sm:block">Album</div>
          <div className="text-center hidden md:block">Favorite</div>
          <div className="text-right flex items-center justify-end"><Clock className="w-4 h-4 ml-auto" /></div>
        </div>

        {/* Rows entries */}
        <div className="flex flex-col gap-1 mt-2">
          {songsList.length === 0 ? (
            /* Skeleton Shimmer Loaders */
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 w-full rounded-2xl skeleton-shimmer opacity-40 my-0.5" />
            ))
          ) : (
            songsList.map((song, index) => {
            const isSongActive = activeSong?.id === song.id;
            const isFav = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() => onSongSelect(song, songsList, contextName)}
                className={`grid grid-cols-[40px_1fr_50px] sm:grid-cols-[40px_2fr_1fr_50px] md:grid-cols-[48px_4fr_3fr_1fr_60px] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl cursor-pointer transition-all duration-150 items-center border group relative ${
                  isSongActive 
                    ? 'bg-[#1a1a1a] border-transparent text-[#1DB954] font-semibold' 
                    : 'border-transparent text-[#b3b3b3] hover:bg-[#282828] hover:text-white'
                }`}
              >
                
                {/* 1. Play state numbers index */}
                <div className="text-center flex items-center justify-center">
                  {isSongActive && isPlaying ? (
                    /* Dynamic mini animated breathing EQ on active track */
                    <div className="flex items-end gap-[2px] h-3.5 w-3.5 mb-0.5">
                      <span className="w-[3px] bg-cyber-green eq-bar animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <span className="w-[3px] bg-cyber-green eq-bar animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <span className="w-[3px] bg-cyber-green eq-bar animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden text-xs md:text-sm font-semibold">{index + 1}</span>
                      <Play className="hidden group-hover:block w-4 h-4 text-cyber-green fill-current" />
                    </>
                  )}
                </div>

                {/* 2. Metadata: Album art, Title, artist */}
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0 pr-2 sm:pr-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    {song.cover ? (
                      <img src={song.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-cyber-purple/10 flex items-center justify-center text-cyber-purple">
                        <Music className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs md:text-sm truncate ${isSongActive ? 'text-cyber-green' : 'text-slate-200 group-hover:text-cyber-green transition-colors'}`}>
                      {song.title}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-500 truncate mt-0.5">{song.artist}</span>
                  </div>
                </div>

                {/* 3. Album title column */}
                <div className="truncate text-xs md:text-sm pr-6 hidden sm:block">{song.album}</div>

                {/* 4. Favorite Hearts toggler column */}
                <div className="text-center justify-center hidden md:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all duration-100 ${isFav ? 'text-red-500 scale-105' : 'text-slate-600 hover:text-white'}`}
                  >
                    <Heart className="w-4 h-4 fill-current" style={{ fill: isFav ? 'currentColor' : 'none' }} />
                  </button>
                </div>

                {/* 5. Duration timer / right ellipses option triggers */}
                <div className="text-right flex items-center justify-end gap-1.5 md:gap-3">
                  
                  {/* Song Delete garbage triggers */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (contextName.startsWith('playlist-')) {
                        const pid = contextName.replace('playlist-', '');
                        onRemoveSongFromPlaylist(pid, song.id);
                      } else {
                        onDeleteSong(song.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={contextName.startsWith('playlist-') ? "Remove from playlist" : "Delete from database"}
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>

                  {/* Playlist selector popover dropdown triggers */}
                  {!contextName.startsWith('playlist-') && playlists.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlaylistMenuId(showPlaylistMenuId === song.id ? null : song.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white"
                        title="Add to playlist"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      
                      {showPlaylistMenuId === song.id && (
                        <div className="absolute right-0 mt-2 w-40 md:w-48 py-1 rounded-xl bg-cyber-dark border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold tracking-widest text-slate-500 uppercase border-b border-white/5 mb-1">
                            Add to playlist
                          </div>
                          {playlists.map((playlist) => {
                            const isAlreadyIn = playlist.songIds.includes(song.id);
                            return (
                              <button
                                key={playlist.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isAlreadyIn) {
                                    onAddSongToPlaylist(playlist.id, song.id);
                                  } else {
                                    addToast('Song is already in this playlist!', 'info');
                                  }
                                  setShowPlaylistMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-[11px] font-semibold hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-between"
                              >
                                <span className="truncate pr-2">{playlist.name}</span>
                                {isAlreadyIn && <Check className="w-3 h-3 text-cyber-green flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] md:text-xs font-bold text-slate-500 w-8 md:w-10 text-right">{song.duration}</span>
                </div>

              </div>
            );
            })
          )}
        </div>
      </div>
    );
  }
};

export default MainContent;
