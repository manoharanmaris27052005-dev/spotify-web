import React from 'react';
import { Home, Search, Library, Heart, ListMusic, ChevronLeft, ChevronRight, Music2, X, Plus } from 'lucide-react';

const Sidebar = ({
  activeView,
  setActiveView,
  playlists,
  isCollapsed,
  setIsCollapsed,
  setSelectedPlaylistId,
  selectedPlaylistId,
  mobileMenuOpen,
  setMobileMenuOpen,
  onToggleQueue
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'favorites', label: 'Liked Songs', icon: Heart },
  ];

  const handlePlaylistClick = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setActiveView('playlist-details');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (id) => {
    setActiveView(id);
    setSelectedPlaylistId(null);
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ collapsed = false, mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 ${collapsed ? 'justify-center px-4' : ''}`}>
        <div className="flex-shrink-0">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-xl tracking-tight">VibeVault</span>
        )}
      </div>

      {/* Main Nav */}
      <nav className={`px-3 mb-2 ${collapsed ? 'px-2' : ''}`}>
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id && !selectedPlaylistId;
          return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              title={collapsed ? label : ''}
              className={`nav-item flex items-center gap-4 w-full rounded-md px-3 py-2.5 mb-0.5 text-sm font-semibold ${
                isActive
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? (id === 'favorites' ? 'text-[#1DB954]' : 'text-white') : id === 'favorites' ? 'text-[#b3b3b3] group-hover:text-white' : ''}`} />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-white/5 my-2" />

      {/* Library Section */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3">
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-[#6a6a6a] uppercase">Playlists</span>
            <Plus className="w-4 h-4 text-[#6a6a6a] hover:text-white cursor-pointer transition-colors" />
          </div>

          {playlists.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-[#6a6a6a]">No playlists yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {playlists.map((playlist) => {
                const isActive = activeView === 'playlist-details' && selectedPlaylistId === playlist.id;
                return (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className={`nav-item flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-[#2a2a2a] text-white font-medium'
                        : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-[#6a6a6a]" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-sm leading-tight">{playlist.name}</p>
                      <p className="text-[11px] text-[#6a6a6a] mt-0.5">Playlist</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Collapse Button */}
      {!mobile && (
        <div className={`p-3 border-t border-white/5 ${collapsed ? 'flex justify-center' : 'flex justify-end'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-[#2a2a2a] text-[#6a6a6a] hover:text-white transition-all"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#000000] h-full z-40 transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70"
        />
        <div className={`absolute top-0 bottom-0 left-0 w-[280px] bg-[#121212] flex flex-col shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="text-white font-bold text-lg">VibeVault</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent mobile={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
