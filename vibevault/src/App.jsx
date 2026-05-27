import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import SleepTimerModal from './components/SleepTimerModal';
import Toast from './components/Toast';
import { 
  getAllSongs, saveSong, deleteSongFromDB, 
  getAllPlaylists, savePlaylist, deletePlaylistFromDB, 
  getSetting, saveSetting 
} from './db/indexedDB';

const App = () => {
  const [activeView, setActiveView] = useState('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lists & collections
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);

  // Audio Engine states
  const [activeSong, setActiveSong] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Overlay states
  const [activeTimer, setActiveTimer] = useState(null); // remaining minutes
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Ref audio caches
  const soundRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const animFrameRef = useRef(null);

  // Web Audio Visualizer AnalyserNode Ref
  const analyserRef = useRef(null);

  // Dynamic Background Glow Color
  const [coverGlowColor, setCoverGlowColor] = useState('rgba(139, 92, 246, 0.15)'); // Default purple

  // Toast dispatcher helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load Database Orchestrations
  useEffect(() => {
    const loadDBContents = async () => {
      try {
        let savedSongs = await getAllSongs();
        
        // --- 1. Automatic Cleanup of Old Duplicates ---
        const seenTitles = new Set();
        for (const song of savedSongs) {
          // Clean the title in case it has (1), (2) etc.
          const baseTitle = song.title.replace(/\s\(\d+\)$/, '').trim().toLowerCase();
          if (seenTitles.has(baseTitle)) {
            await deleteSongFromDB(song.id); // Wipe the duplicate permanently
          } else {
            seenTitles.add(baseTitle);
          }
        }
        
        // Refresh the list after cleanup
        savedSongs = await getAllSongs();
        
        // --- 2. Dynamic Prepopulation ---
        if (savedSongs.length < 17) {
          setIsDownloading(true);
          await prepopulateDBWithAssets();
          savedSongs = await getAllSongs();
          setIsDownloading(false);
          addToast("Offline cache successfully downloaded!", "success");
        }

        setSongs(savedSongs);

        const savedPlaylists = await getAllPlaylists();
        setPlaylists(savedPlaylists);

        const savedFavs = await getSetting('favorites', []);
        setFavorites(savedFavs);

        const savedRecents = await getSetting('recentTracks', []);
        setRecentTracks(savedRecents);

        const savedVol = await getSetting('volume', 0.8);
        setVolume(savedVol);
        Howler.volume(savedVol);

        // Resume last played track if configured
        const lastTrack = await getSetting('lastPlayedSong', null);
        if (lastTrack) {
          const match = savedSongs.find(s => s.id === lastTrack.id);
          if (match) {
            setActiveSong(match);
            setDuration(lastTrack.durationSeconds || 0);
          }
        }
      } catch (err) {
        console.error("IndexedDB bootstrap failed", err);
        addToast("IndexedDB database initialization failed!", "error");
      }
    };

    loadDBContents();
  }, []);

  // Prepopulate songs from static parent folders
  const prepopulateDBWithAssets = async () => {
    const urls = [
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709175/WhatsApp_Audio_2026-05-25_at_4.53.07_PM_kx8axm.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709175/WhatsApp_Audio_2026-05-25_at_4.53.10_PM_vljwnl.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709173/WhatsApp_Audio_2026-05-25_at_4.53.08_PM_ehv5s3.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709173/WhatsApp_Audio_2026-05-25_at_4.53.06_PM_iojeeh.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709171/WhatsApp_Audio_2026-05-25_at_4.53.06_PM_-_Copy_o0wawv.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709168/WhatsApp_Audio_2026-05-25_at_4.53.01_PM_len0qh.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709154/WhatsApp_Audio_2026-05-25_at_4.53.03_PM_ksx7zz.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709152/WhatsApp_Audio_2026-05-21_at_3.52.05_PM_rqtd1t.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709152/WhatsApp_Audio_2026-05-21_at_3.52.07_PM_dl4rjn.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709151/WhatsApp_Audio_2026-05-21_at_3.52.08_PM_uddnst.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709149/WhatsApp_Audio_2026-05-25_at_4.53.09_PM_yifo8h.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709148/Sorimuthu_Ayyanar_song_ra281l.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709114/WhatsApp_Audio_2026-05-25_at_4.53.02_PM_dyxmdq.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709114/WhatsApp_Audio_2026-05-25_at_4.53.00_PM_hlx98i.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709114/WhatsApp_Audio_2026-05-25_at_4.53.04_PM_lgj1hh.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709112/WhatsApp_Audio_2026-05-21_at_3.52.06_PM_kbjktq.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709112/WhatsApp_Audio_2026-05-25_at_4.53.05_PM_goxihh.m4a",
      "https://res.cloudinary.com/da9hihmx5/video/upload/v1779709108/WhatsApp_Audio_2026-05-25_at_4.47.27_PM_gjejr3.m4a"
    ];

    const mockTracks = urls.map((url) => {
      const parts = url.split('/');
      let filename = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
      filename = filename.replace(/_[a-z0-9]{6}$/, ""); // remove cloudinary hash
      let title = filename.replace(/_/g, ' ').replace('- Copy', '').trim(); // clean up name
      return {
        title: title,
        artist: "Cloud Sync",
        album: "VibeVault Imports",
        src: url,
        duration: "Unknown"
      };
    });

    let existingSongs = await getAllSongs();
    
    for (let i = 0; i < mockTracks.length; i++) {
      const track = mockTracks[i];
      // Strict duplicate title prevention to keep UI clean
      if (existingSongs.some(s => s.title.toLowerCase() === track.title.toLowerCase())) {
        continue;
      }
      let displayTitle = track.title;

      try {
        const audioRes = await fetch(track.src);
        const audioBlob = await audioRes.blob();

        // Get duration directly if possible with timeout
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        const durationSeconds = await Promise.race([
          new Promise((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              URL.revokeObjectURL(audio.src);
              resolve(audio.duration || 0);
            });
            audio.addEventListener('error', () => resolve(0));
          }),
          new Promise(resolve => setTimeout(() => resolve(0), 1500))
        ]);

        const minutes = Math.floor(durationSeconds / 60);
        const seconds = Math.floor(durationSeconds % 60);
        const durationStr = durationSeconds > 0 ? `${minutes}:${seconds < 10 ? '0' : ''}${seconds}` : '3:00';

        await saveSong({
          file: audioBlob,
          src: track.src,
          title: displayTitle,
          artist: track.artist,
          album: track.album,
          duration: durationStr,
          cover: "", 
          addedAt: Date.now()
        });
        
        existingSongs.push({ title: displayTitle });
      } catch (e) {
        console.warn("Asset download failed, falling back to streaming for: ", track.title, e);
        try {
          await saveSong({
            file: null,
            src: track.src,
            title: displayTitle,
            artist: track.artist,
            album: track.album,
            duration: "Unknown",
            cover: "", 
            addedAt: Date.now()
          });
        } catch (err) {
          console.error("Critical failure adding song:", err);
        }
      }
    }
  };

  // Re-fetch all songs catalog
  const refreshSongs = async () => {
    const freshSongs = await getAllSongs();
    setSongs(freshSongs);
  };

  // Re-fetch custom playlists catalog
  const refreshPlaylists = async () => {
    const freshPlaylists = await getAllPlaylists();
    setPlaylists(freshPlaylists);
  };

  // 2. Playback Howler Integration Engine Core
  useEffect(() => {
    if (!activeSong) return;

    // Clean up previous sound instance
    if (soundRef.current) {
      soundRef.current.unload();
    }

    // Convert local binary Blob stored in IndexedDB to transient Object URL or use direct remote URL
    const audioSrc = activeSong.file ? URL.createObjectURL(activeSong.file) : activeSong.src;

    const sound = new Howl({
      src: [audioSrc],
      format: ['mp3', 'wav', 'm4a', 'mp4'],
      volume: volume,
      mute: isMuted,
      html5: false, // Force Web Audio API buffer to enable AnalyserNode frequency streams!
      onload: () => {
        setDuration(sound.duration());
        // Save metadata configuration to resume later
        saveSetting('lastPlayedSong', { id: activeSong.id, durationSeconds: sound.duration() });
      },
      onplay: () => {
        setIsPlaying(true);
        // Start requestAnimationFrame playback tracking loops
        animFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
        setupWebAudioVisualizer();
      },
      onpause: () => {
        setIsPlaying(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      },
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      },
      onend: () => {
        setIsPlaying(false);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        handleTrackEnded();
      }
    });

    soundRef.current = sound;

    // Play if states match
    if (isPlaying) {
      sound.play();
    }

    // Shift dynamic glow color shadows
    calculateGlowColor(activeSong.cover);

    // Clean up URL object on unloads if it was a blob
    return () => {
      if (activeSong.file) URL.revokeObjectURL(audioSrc);
    };
  }, [activeSong]);

  const updatePlaybackProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      setCurrentTime(soundRef.current.seek());
      animFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
    }
  };

  // Connect Master gain to analyser
  const setupWebAudioVisualizer = () => {
    try {
      if (analyserRef.current) return; // Already setup

      // Tap into master audio context
      const ctx = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = Howler.masterGain;

      if (ctx && masterGain) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        masterGain.connect(analyser);
        analyserRef.current = analyser;
      }
    } catch (e) {
      console.warn("Web Audio Visualizer initialization skipped: ", e);
    }
  };

  // Dynamic calculations of cover visual glows
  const calculateGlowColor = (base64Img) => {
    if (!base64Img) {
      setCoverGlowColor('rgba(139, 92, 246, 0.15)');
      return;
    }
    // Set nice purple/green overlays
    const colors = ['rgba(16, 185, 129, 0.25)', 'rgba(139, 92, 246, 0.25)', 'rgba(236, 72, 153, 0.2)'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCoverGlowColor(randomColor);
  };

  // Playback Operations
  const handleTogglePlay = () => {
    if (!soundRef.current) {
      // Pick first song if nothing is loaded
      if (songs.length > 0) {
        handleSongSelect(songs[0], songs);
      }
      return;
    }

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleSongSelect = (song, queueContext, contextName = 'library') => {
    setActiveSong(song);
    setActiveQueue(queueContext);
    setIsPlaying(true);
    
    // Add to Recently Played catalog
    addToRecentPlayed(song.id);
  };

  const handleNext = () => {
    if (activeQueue.length === 0) return;
    
    const currIndex = activeQueue.findIndex(s => s.id === activeSong?.id);
    let nextIndex = 0;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * activeQueue.length);
    } else if (currIndex !== -1) {
      nextIndex = (currIndex + 1) % activeQueue.length;
    }

    handleSongSelect(activeQueue[nextIndex], activeQueue);
  };

  const handlePrev = () => {
    if (soundRef.current && currentTime > 3) {
      soundRef.current.seek(0);
      setCurrentTime(0);
      return;
    }

    if (activeQueue.length === 0) return;

    const currIndex = activeQueue.findIndex(s => s.id === activeSong?.id);
    let prevIndex = activeQueue.length - 1;

    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * activeQueue.length);
    } else if (currIndex !== -1) {
      prevIndex = (currIndex - 1 + activeQueue.length) % activeQueue.length;
    }

    handleSongSelect(activeQueue[prevIndex], activeQueue);
  };

  const handleSeek = (seconds) => {
    if (soundRef.current) {
      soundRef.current.seek(seconds);
      setCurrentTime(seconds);
    }
  };

  const handleVolumeChange = (vol) => {
    setVolume(vol);
    Howler.volume(vol);
    saveSetting('volume', vol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    Howler.mute(nextMute);
  };

  const handleTrackEnded = () => {
    if (isRepeat) {
      if (soundRef.current) {
        soundRef.current.seek(0);
        soundRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  // Add song to recent list
  const addToRecentPlayed = async (songId) => {
    let recents = [...recentTracks].filter(id => id !== songId);
    recents.unshift(songId);
    recents = recents.slice(0, 10); // Cap at 10 items
    setRecentTracks(recents);
    await saveSetting('recentTracks', recents);
  };

  // Toggle Favorite hearts
  const handleToggleFavorite = async (songId) => {
    let favs = [...favorites];
    if (favs.includes(songId)) {
      favs = favs.filter(id => id !== songId);
      addToast("Removed from favorites", "info");
    } else {
      favs.push(songId);
      addToast("Saved to favorites", "success");
    }
    setFavorites(favs);
    await saveSetting('favorites', favs);
  };

  // 3. Custom dynamic playlists managers
  const handleCreatePlaylist = async (name) => {
    const newPlaylist = {
      id: 'playlist_' + Date.now(),
      name,
      songIds: []
    };
    await savePlaylist(newPlaylist);
    addToast(`Playlist "${name}" created!`, 'success');
    refreshPlaylists();
  };

  const handleDeletePlaylist = async (id) => {
    await deletePlaylistFromDB(id);
    addToast("Playlist deleted", "info");
    setActiveView('home');
    refreshPlaylists();
  };

  const handleAddSongToPlaylist = async (playlistId, songId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (playlist.songIds.includes(songId)) {
      addToast("Song already in playlist!", "info");
      return;
    }

    const updated = {
      ...playlist,
      songIds: [...playlist.songIds, songId]
    };

    await savePlaylist(updated);
    addToast(`Added to "${playlist.name}"`, "success");
    refreshPlaylists();
  };

  const handleRemoveSongFromPlaylist = async (playlistId, songId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updated = {
      ...playlist,
      songIds: playlist.songIds.filter(id => id !== songId)
    };

    await savePlaylist(updated);
    addToast("Removed from playlist", "info");
    refreshPlaylists();
  };

  const handleDeleteSong = async (id) => {
    if (confirm("Are you sure you want to delete this track from offline vault?")) {
      // If currently playing, stop it first
      if (activeSong?.id === id) {
        if (soundRef.current) soundRef.current.stop();
        setActiveSong(null);
        setIsPlaying(false);
      }
      
      await deleteSongFromDB(id);
      addToast("Song removed from database storage", "info");
      refreshSongs();
    }
  };

  // 4. Sleep Timer count down sequences
  const handleSetTimer = (minutes) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    if (minutes === null) {
      setActiveTimer(null);
      addToast("Sleep timer deactivated", "info");
      setIsTimerModalOpen(false);
      return;
    }

    setActiveTimer(minutes);
    setIsTimerModalOpen(false);
    addToast(`Sleep timer active: ${minutes} minutes`, "success");

    timerIntervalRef.current = setInterval(() => {
      setActiveTimer((prev) => {
        if (prev <= 1) {
          // Timer finished! Fade audio volume and stop
          clearInterval(timerIntervalRef.current);
          fadeAndPauseAudio();
          return null;
        }
        return prev - 1;
      });
    }, 60000);
  };

  const fadeAndPauseAudio = () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.fade(volume, 0, 2000);
      setTimeout(() => {
        soundRef.current.pause();
        soundRef.current.volume(volume); // Reset volume coefficients
        setIsPlaying(false);
        addToast("Sleep timer complete: Playback paused.", "info");
      }, 2000);
    }
  };

  // 5. Global Keyboard Shortcuts listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is actively writing inside inputs
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (key === 'arrowright') {
        e.preventDefault();
        if (e.shiftKey) {
          handleNext();
        } else if (soundRef.current) {
          const target = Math.min(currentTime + 10, duration);
          handleSeek(target);
        }
      } else if (key === 'arrowleft') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrev();
        } else if (soundRef.current) {
          const target = Math.max(currentTime - 10, 0);
          handleSeek(target);
        }
      } else if (key === 'q') {
        setIsCollapsed(prev => !prev);
      } else if (key === 'm') {
        handleToggleMute();
      } else if (key === 'l') {
        if (activeSong) {
          handleToggleFavorite(activeSong.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeSong, currentTime, duration, volume, isMuted, songs]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black relative text-white font-sans">
      
      {/* Full-screen Loading Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-[#282828] border-t-[#1DB954] rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(29,185,84,0.4)]"></div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Downloading Offline Cache...</h2>
          <p className="text-[#b3b3b3] text-sm font-semibold max-w-sm text-center">
            We are securely downloading your tracks directly into your browser's local vault. This only happens once.
          </p>
        </div>
      )}

      {/* Dynamic Cover Radial Gradient Backdrop */}
      <div 
        className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none transition-all duration-1000 z-0 opacity-40"
        style={{
          background: `radial-gradient(100% 100% at 50% 0%, ${coverGlowColor} 0%, rgba(7, 7, 8, 0) 100%)`
        }}
      />

      <div className="flex flex-row flex-grow h-[calc(100vh-96px)] relative z-10 w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          playlists={playlists}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setSelectedPlaylistId={setSelectedPlaylistId}
          selectedPlaylistId={selectedPlaylistId}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Central Workspace Area */}
        <MainContent
          activeView={activeView}
          setActiveView={setActiveView}
          songs={songs}
          playlists={playlists}
          recentTracks={recentTracks}
          favorites={favorites}
          activeSong={activeSong}
          isPlaying={isPlaying}
          onSongSelect={handleSongSelect}
          onTogglePlay={handleTogglePlay}
          onToggleFavorite={handleToggleFavorite}
          onAddSongToPlaylist={handleAddSongToPlaylist}
          onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onDeleteSong={handleDeleteSong}
          selectedPlaylistId={selectedPlaylistId}
          addToast={addToast}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      {/* Fixed bottom controls */}
      <MusicPlayer
        currentSong={activeSong}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        isRepeat={isRepeat}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        progress={currentTime}
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTimer={activeTimer}
        onOpenTimer={() => setIsTimerModalOpen(true)}
        isFavorite={activeSong ? favorites.includes(activeSong.id) : false}
        onToggleFavorite={() => activeSong && handleToggleFavorite(activeSong.id)}
        analyserNode={analyserRef.current}
      />

      {/* Config Sleep Timer dialog */}
      <SleepTimerModal
        isOpen={isTimerModalOpen}
        activeTimer={activeTimer}
        onSetTimer={handleSetTimer}
        onClose={() => setIsTimerModalOpen(false)}
      />

      {/* Floating Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

    </div>
  );
};

export default App;
