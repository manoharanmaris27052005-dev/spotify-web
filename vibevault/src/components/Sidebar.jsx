import React from 'react';
import { Home, Search, Library, Heart, ListMusic, ChevronLeft, ChevronRight, Disc, X } from 'lucide-react';

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  playlists, 
  isCollapsed, 
  setIsCollapsed,
  setSelectedPlaylistId,
  selectedPlaylistId,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <Library className="w-5 h-5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-5 h-5 text-red-500" /> },
  ];

  const handlePlaylistClick = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setActiveView('playlist-details');
    setMobileMenuOpen(false); // Close mobile drawer on selection
  };

  const handleNavClick = (id) => {
    setActiveView(id);
    setSelectedPlaylistId(null);
    setMobileMenuOpen(false); // Close mobile drawer on selection
  };

  return (
    <>
      {/* ========================================== */}
      {/* 1. DESKTOP SIDEBAR */}
      {/* ========================================== */}
      <aside className={`hidden md:flex bg-black flex-col h-full z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Brand Logo */}
        <div className={`p-6 flex items-center gap-3 border-b border-white/5 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="p-1 rounded text-white flex-shrink-0">
            <ListMusic className="w-8 h-8" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white">VibeVault</span>
              <span className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">Offline Vault</span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-4 flex-grow overflow-y-auto flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative w-full text-left ${
                (activeView === item.id && !selectedPlaylistId)
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {/* Active Indicator Bar */}
              {(activeView === item.id && !selectedPlaylistId) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1DB954] rounded-r-md animate-in slide-in-from-left-2 duration-200" />
              )}
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
              
              {/* Hover Tooltip if Collapsed */}
              {isCollapsed && (
                <div className="absolute left-24 px-3 py-1.5 rounded-lg bg-cyber-dark border border-white/10 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}

          {/* Custom Playlists list */}
          <div className="mt-6">
            {!isCollapsed && (
              <div className="px-4 mb-2 flex items-center justify-between text-xs font-bold tracking-widest text-slate-500 uppercase">
                <span>Playlists</span>
                <ListMusic className="w-4 h-4 text-slate-500" />
              </div>
            )}
            
            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative truncate text-left w-full ${
                    (activeView === 'playlist-details' && selectedPlaylistId === playlist.id)
                      ? 'text-white bg-[#1a1a1a]'
                      : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {(activeView === 'playlist-details' && selectedPlaylistId === playlist.id) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1DB954] rounded-r-md animate-in slide-in-from-left-2 duration-200" />
                  )}
                  <ListMusic className="w-5 h-5 text-[#b3b3b3] group-hover:text-white" />
                  {!isCollapsed && <span className="truncate">{playlist.name}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-24 px-3 py-1.5 rounded-lg bg-cyber-dark border border-white/10 text-xs font-bold text-cyber-green opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                      {playlist.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Collapse Toggle Footer */}
        <div className="p-4 border-t border-white/5 flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white hover:scale-105 active:scale-95 duration-200 transition-all border border-white/5"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

      </aside>

      {/* ========================================== */}
      {/* 2. MOBILE DRAWER OVERLAY */}
      {/* ========================================== */}
      <div className={`fixed inset-0 z-50 flex md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Backdrop glass blur dismiss */}
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sliding Drawer Container */}
        <div className={`absolute top-0 bottom-0 left-0 w-72 bg-[#09090b]/95 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyber-purple to-cyber-green text-cyber-dark">
                <Disc className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="font-extrabold text-base bg-gradient-to-r from-cyber-purple to-cyber-green bg-clip-text text-transparent">VibeVault</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 w-full text-left ${
                  (activeView === item.id && !selectedPlaylistId)
                    ? 'bg-gradient-to-r from-cyber-purple/20 to-cyber-green/10 text-white border border-cyber-purple/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Custom Playlists Section */}
            <div className="mt-6">
              <div className="px-4 mb-2 flex items-center justify-between text-xs font-bold tracking-widest text-slate-500 uppercase">
                <span>Playlists</span>
                <ListMusic className="w-4 h-4 text-slate-500" />
              </div>
              
              <div className="flex flex-col gap-1 pr-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left truncate ${
                      (activeView === 'playlist-details' && selectedPlaylistId === playlist.id)
                        ? 'bg-white/5 text-cyber-green border border-white/5'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ListMusic className="w-5 h-5 text-cyber-green" />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
