// ==========================================
// SPOTIFY PREMIUM CLONE - MODULAR CONTROLLER
// ==========================================

// 1. Static Song Data Mapping
const songs = [
    {
        id: "midnight-breeze",
        title: "Midnight Breeze",
        artist: "Lofi Echoes",
        album: "Urban Nocturnes",
        cover: "images/cover1.png",
        src: "songs/WhatsApp Audio 2026-05-21 at 3.52.05 PM.mp4",
        staticDuration: "2:44"
    },
    {
        id: "neon-dreams",
        title: "Neon Dreams",
        artist: "Synthwave Cruiser",
        album: "Retro Drive",
        cover: "images/cover2.png",
        src: "songs/WhatsApp Audio 2026-05-21 at 3.52.06 PM.mp4",
        staticDuration: "2:11"
    },
    {
        id: "golden-hour",
        title: "Golden Hour",
        artist: "Acoustic Horizon",
        album: "Sunset Whispers",
        cover: "images/cover3.png",
        src: "songs/WhatsApp Audio 2026-05-21 at 3.52.07 PM.mp4",
        staticDuration: "2:38"
    },
    {
        id: "electric-pulse",
        title: "Electric Pulse",
        artist: "Digital Mirage",
        album: "Cybernetic Heart",
        cover: "images/cover4.png",
        src: "songs/WhatsApp Audio 2026-05-21 at 3.52.08 PM.mp4",
        staticDuration: "2:24"
    }
];

// ==========================================
// AUDIO CONTROLLER MODULE
// ==========================================
class AudioController {
    constructor(audioElement) {
        this.audio = audioElement;
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'off'; // 'off' | 'all' | 'one'
        
        // Hooks for UI updates
        this.onPlayStateChange = null;
        this.onTrackChange = null;
        this.onTimeUpdate = null;
        this.onDurationChange = null;
        this.onTrackEnded = null;

        this.initListeners();
    }

    initListeners() {
        this.audio.addEventListener('timeupdate', () => {
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.audio.currentTime, this.audio.duration);
            }
        });

        this.audio.addEventListener('loadedmetadata', () => {
            if (this.onDurationChange) {
                this.onDurationChange(this.audio.duration);
            }
        });

        this.audio.addEventListener('ended', () => {
            if (this.onTrackEnded) {
                this.onTrackEnded();
            }
        });
    }

    loadSong(index, autostart = true) {
        if (index < 0 || index >= songs.length) return;
        this.currentTrackIndex = index;
        const song = songs[this.currentTrackIndex];
        this.audio.src = song.src;
        this.audio.load();

        if (this.onTrackChange) {
            this.onTrackChange(song, this.currentTrackIndex);
        }

        if (autostart) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        this.isPlaying = true;
        this.audio.play().then(() => {
            if (this.onPlayStateChange) {
                this.onPlayStateChange(true);
            }
        }).catch(err => {
            console.warn("Autoplay blocked or playback interrupted:", err);
            this.isPlaying = false;
            if (this.onPlayStateChange) {
                this.onPlayStateChange(false);
            }
        });
    }

    pause() {
        this.isPlaying = false;
        this.audio.pause();
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    next(activePlaylistIndices = null) {
        let indices = activePlaylistIndices || songs.map((_, i) => i);
        if (indices.length === 0) return;

        let nextIndex = this.currentTrackIndex;

        if (this.isShuffle) {
            if (indices.length > 1) {
                do {
                    const rand = Math.floor(Math.random() * indices.length);
                    nextIndex = indices[rand];
                } while (nextIndex === this.currentTrackIndex);
            }
        } else {
            const currentPos = indices.indexOf(this.currentTrackIndex);
            if (currentPos !== -1) {
                const nextPos = (currentPos + 1) % indices.length;
                nextIndex = indices[nextPos];
            } else {
                nextIndex = indices[0];
            }
        }

        this.loadSong(nextIndex, true);
    }

    prev(activePlaylistIndices = null) {
        if (this.audio.currentTime > 3) {
            this.seek(0);
            return;
        }

        let indices = activePlaylistIndices || songs.map((_, i) => i);
        if (indices.length === 0) return;

        let prevIndex = this.currentTrackIndex;

        if (this.isShuffle) {
            if (indices.length > 1) {
                do {
                    const rand = Math.floor(Math.random() * indices.length);
                    prevIndex = indices[rand];
                } while (prevIndex === this.currentTrackIndex);
            }
        } else {
            const currentPos = indices.indexOf(this.currentTrackIndex);
            if (currentPos !== -1) {
                const prevPos = (currentPos - 1 + indices.length) % indices.length;
                prevIndex = indices[prevPos];
            } else {
                prevIndex = indices[indices.length - 1];
            }
        }

        this.loadSong(prevIndex, true);
    }

    seek(time) {
        this.audio.currentTime = time;
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    toggleMute(lastVolValue) {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            return 0;
        } else {
            this.audio.volume = lastVolValue || 0.8;
            return this.audio.volume;
        }
    }
}

// ==========================================
// UI & STATE CONTROLLER MODULE
// ==========================================
class UIController {
    constructor(audioController) {
        this.ac = audioController;

        // Dynamic State Arrays (from Storage)
        this.likedSongs = [];
        this.recentlyPlayed = [];
        this.customPlaylists = [];
        this.queue = [];
        this.activeView = 'home';
        this.activeContext = 'all'; // 'all' | 'liked' | 'recent' | playlistId
        this.activeCustomPlaylistId = null;
        this.lastVolume = 0.8;

        // Context Menu State
        this.contextMenuIndex = null;

        // History routing stack
        this.historyStack = [];
        this.historyPointer = -1;

        // Seek dragging state
        this.isDraggingProgress = false;
    }

    init() {
        this.loadLocalStorageData();
        this.setupHooks();
        this.bindEvents();
        this.bindShortcuts();
        
        // Push initial view to history stack
        this.switchView('home', null, true);
        
        // Render Playlists
        this.renderAllPlaylistsSidebar();

        // Load the first song initially without playing to initialize UI elements and track data
        this.ac.loadSong(0, false);

        // Set initial slider styles and values on page load
        const volSlider = document.getElementById('volume-slider');
        const progSlider = document.getElementById('progress-slider');
        if (volSlider) {
            const volVal = volSlider.value;
            volSlider.style.background = `linear-gradient(to right, var(--text-main) 0%, var(--text-main) ${volVal}%, #4f4f4f ${volVal}%, #4f4f4f 100%)`;
            this.ac.setVolume(volVal / 100);
        }
        if (progSlider) {
            progSlider.style.background = `linear-gradient(to right, var(--spotify-green) 0%, var(--spotify-green) 0%, #4f4f4f 0%, #4f4f4f 100%)`;
        }

        // Simulated premium page load fade out
        setTimeout(() => {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.classList.add('fade-out');
            }
        }, 1000);
    }

    loadLocalStorageData() {
        try {
            this.likedSongs = JSON.parse(localStorage.getItem('spotify_liked_songs')) || [];
            this.recentlyPlayed = JSON.parse(localStorage.getItem('spotify_recently_played')) || [];
            this.customPlaylists = JSON.parse(localStorage.getItem('spotify_custom_playlists')) || [];
        } catch (e) {
            console.error("Localstorage load error", e);
            this.likedSongs = [];
            this.recentlyPlayed = [];
            this.customPlaylists = [];
        }
        this.syncSidebarCounts();
    }

    saveState(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        this.syncSidebarCounts();
    }

    syncSidebarCounts() {
        document.getElementById('liked-count-sidebar').textContent = this.likedSongs.length;
        document.getElementById('recent-count-sidebar').textContent = this.recentlyPlayed.length;
    }

    setupHooks() {
        // Play State Toggles
        this.ac.onPlayStateChange = (playing) => {
            const btn = document.getElementById('ctrl-play-pause');
            const playBanner = document.getElementById('liked-play-btn');
            const recentBanner = document.getElementById('recent-play-btn');
            const customPlayBtn = document.getElementById('custom-playlist-play-btn');
            const artEl = document.getElementById('current-player-art');
            const barEq = document.getElementById('player-bar-equalizer');

            if (playing) {
                btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                artEl.classList.add('playing');
                barEq.style.display = 'flex';
                if (playBanner) playBanner.innerHTML = '<i class="fa-solid fa-pause"></i>';
                if (recentBanner) recentBanner.innerHTML = '<i class="fa-solid fa-pause"></i>';
                if (customPlayBtn) customPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                
                // Track Recently Played when playback actually begins
                this.addRecentlyPlayed(this.ac.currentTrackIndex);
            } else {
                btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                artEl.classList.remove('playing');
                barEq.style.display = 'none';
                if (playBanner) playBanner.innerHTML = '<i class="fa-solid fa-play"></i>';
                if (recentBanner) recentBanner.innerHTML = '<i class="fa-solid fa-play"></i>';
                if (customPlayBtn) customPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
            this.updateActiveTrackHighlightStyles();
        };

        // Track changes
        this.ac.onTrackChange = (song, index) => {
            document.getElementById('current-player-art').src = song.cover;
            document.getElementById('current-player-title').textContent = song.title;
            document.getElementById('current-player-artist').textContent = song.artist;
            document.getElementById('progress-slider').value = 0;
            document.getElementById('current-time').textContent = "0:00";
            document.getElementById('total-duration').textContent = song.staticDuration;
            
            // Sync heart on player bar
            const playerHeart = document.getElementById('current-player-heart');
            if (this.likedSongs.includes(index)) {
                playerHeart.className = "player-like-btn liked";
                playerHeart.innerHTML = '<i class="fa-solid fa-heart"></i>';
            } else {
                playerHeart.className = "player-like-btn";
                playerHeart.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }

            this.updateActiveTrackHighlightStyles();
            this.rebuildQueue();
            this.renderQueueDrawer();
        };

        // Time updates
        this.ac.onTimeUpdate = (current, duration) => {
            const slider = document.getElementById('progress-slider');
            const timeLabel = document.getElementById('current-time');
            if (duration && !this.isDraggingProgress) {
                const percent = (current / duration) * 100;
                slider.value = percent;
                slider.style.background = `linear-gradient(to right, var(--spotify-green) 0%, var(--spotify-green) ${percent}%, #4f4f4f ${percent}%, #4f4f4f 100%)`;
                timeLabel.textContent = this.formatTime(current);
            }
        };

        // Loaded metadata duration
        this.ac.onDurationChange = (duration) => {
            document.getElementById('total-duration').textContent = this.formatTime(duration);
        };

        // Track finishes
        this.ac.onTrackEnded = () => {
            if (this.ac.repeatMode === 'one') {
                this.ac.seek(0);
                this.ac.play();
            } else {
                // Spotify premium context auto-stop logic:
                // Stop playback if queue is empty, repeat mode is off, and we just finished the last song of the active context
                const contextIndices = this.getActiveContextIndices();
                const currentPos = contextIndices.indexOf(this.ac.currentTrackIndex);
                if (this.queue.length === 0 && this.ac.repeatMode === 'off' && currentPos === contextIndices.length - 1) {
                    this.ac.pause();
                    this.ac.seek(0);
                    this.showToast("End of playlist");
                } else {
                    this.playNextInContext();
                }
            }
        };
    }

    playNextInContext() {
        if (this.queue.length > 0) {
            // Shift queue and play next
            const nextTrack = this.queue.shift();
            this.ac.loadSong(nextTrack, true);
            this.renderQueueDrawer();
            return;
        }

        // Standard Context cycles
        const contextIndices = this.getActiveContextIndices();
        this.ac.next(contextIndices);
    }

    getActiveContextIndices() {
        if (this.activeContext === 'liked') {
            return this.likedSongs;
        } else if (this.activeContext === 'recent') {
            return this.recentlyPlayed;
        } else if (this.activeContext.startsWith('playlist-')) {
            const pid = this.activeContext.replace('playlist-', '');
            const playlist = this.customPlaylists.find(p => p.id === pid);
            return playlist ? playlist.songIndices : [];
        }
        return songs.map((_, i) => i);
    }

    addRecentlyPlayed(songIndex) {
        // Avoid duplicate spam
        this.recentlyPlayed = this.recentlyPlayed.filter(i => i !== songIndex);
        this.recentlyPlayed.unshift(songIndex);
        
        // Cap list at 10 items
        if (this.recentlyPlayed.length > 10) {
            this.recentlyPlayed.pop();
        }
        
        this.saveState('spotify_recently_played', this.recentlyPlayed);
        
        // Update Home recently played section
        this.renderHomeRecentlyPlayed();
    }

    rebuildQueue() {
        // If queue is empty, dynamically auto-populate with the remaining tracks from the context
        if (this.queue.length === 0) {
            const contextIndices = this.getActiveContextIndices();
            const currPos = contextIndices.indexOf(this.ac.currentTrackIndex);
            
            if (currPos !== -1) {
                // Slice remainder
                this.queue = contextIndices.slice(currPos + 1);
                // If loop all, append start
                if (this.ac.repeatMode === 'all') {
                    this.queue = this.queue.concat(contextIndices.slice(0, currPos));
                }
            }
        }
    }

    // ==========================================
    // DOM INTERACTIVE EVENT BINDINGS
    // ==========================================
    bindEvents() {
        // Primary player controls
        document.getElementById('ctrl-play-pause').addEventListener('click', () => this.ac.togglePlay());
        document.getElementById('ctrl-next').addEventListener('click', () => this.playNextInContext());
        document.getElementById('ctrl-prev').addEventListener('click', () => this.ac.prev(this.getActiveContextIndices()));
        
        document.getElementById('ctrl-shuffle').addEventListener('click', () => {
            this.ac.isShuffle = !this.ac.isShuffle;
            document.getElementById('ctrl-shuffle').classList.toggle('active', this.ac.isShuffle);
            this.showToast(this.ac.isShuffle ? "Shuffle ON" : "Shuffle OFF");
        });

        document.getElementById('ctrl-repeat').addEventListener('click', () => {
            const btn = document.getElementById('ctrl-repeat');
            if (this.ac.repeatMode === 'off') {
                this.ac.repeatMode = 'all';
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
                this.showToast("Repeat context ON");
            } else if (this.ac.repeatMode === 'all') {
                this.ac.repeatMode = 'one';
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-repeat" style="position: relative;"></i><span style="font-size: 8px; font-weight: 800; position: absolute; top: 1px; right: 0;">1</span>';
                this.showToast("Repeat song ON");
            } else {
                this.ac.repeatMode = 'off';
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
                this.showToast("Repeat OFF");
            }
            this.rebuildQueue();
            this.renderQueueDrawer();
        });

        // Timeline Slider seek interactions
        const progressSlider = document.getElementById('progress-slider');
        
        progressSlider.addEventListener('mousedown', () => {
            this.isDraggingProgress = true;
        });
        progressSlider.addEventListener('touchstart', () => {
            this.isDraggingProgress = true;
        });

        progressSlider.addEventListener('input', () => {
            if (this.ac.audio.duration) {
                const seekTo = (progressSlider.value / 100) * this.ac.audio.duration;
                document.getElementById('current-time').textContent = this.formatTime(seekTo);
                const percent = progressSlider.value;
                progressSlider.style.background = `linear-gradient(to right, var(--spotify-green) 0%, var(--spotify-green) ${percent}%, #4f4f4f ${percent}%, #4f4f4f 100%)`;
            }
        });

        progressSlider.addEventListener('change', () => {
            if (this.ac.audio.duration) {
                const seekTo = (progressSlider.value / 100) * this.ac.audio.duration;
                this.ac.seek(seekTo);
            }
            this.isDraggingProgress = false;
        });

        progressSlider.addEventListener('mouseup', () => {
            this.isDraggingProgress = false;
        });
        progressSlider.addEventListener('touchend', () => {
            this.isDraggingProgress = false;
        });

        // Volume control slider
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', () => {
            const val = volumeSlider.value / 100;
            this.ac.setVolume(val);
            volumeSlider.style.background = `linear-gradient(to right, var(--text-main) 0%, var(--text-main) ${volumeSlider.value}%, #4f4f4f ${volumeSlider.value}%, #4f4f4f 100%)`;
            this.updateVolumeUI(val);
            if (val > 0) this.lastVolume = val;
        });

        // Mute / Unmute Button
        document.getElementById('ctrl-mute').addEventListener('click', () => {
            const currentVol = this.ac.audio.volume;
            const updatedVol = this.ac.toggleMute(this.lastVolume);
            volumeSlider.value = updatedVol * 100;
            volumeSlider.style.background = `linear-gradient(to right, var(--text-main) 0%, var(--text-main) ${volumeSlider.value}%, #4f4f4f ${volumeSlider.value}%, #4f4f4f 100%)`;
            this.updateVolumeUI(updatedVol);
        });

        // Sidebar navigation view hooks
        document.getElementById('nav-home').addEventListener('click', (e) => { e.preventDefault(); this.switchView('home'); });
        document.getElementById('nav-search').addEventListener('click', (e) => { e.preventDefault(); this.switchView('search'); });
        document.getElementById('playlist-liked-item').addEventListener('click', (e) => { e.preventDefault(); this.switchView('liked'); });
        document.getElementById('playlist-recent-item').addEventListener('click', (e) => { e.preventDefault(); this.switchView('recent'); });

        // Header navigation (back and forward chevrons)
        document.getElementById('header-back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('header-forward-btn').addEventListener('click', () => this.goForward());

        // Profile button toast trigger
        document.querySelector('.profile-btn').addEventListener('click', () => this.showToast("Profile features coming soon!"));

        // Search inputs
        document.getElementById('search-query').addEventListener('input', (e) => {
            this.renderSearchQuery(e.target.value);
        });

        // Create custom playlist buttons
        document.getElementById('create-playlist-btn').addEventListener('click', () => this.handleCreatePlaylist());
        document.getElementById('add-playlist-sidebar-btn').addEventListener('click', () => this.handleCreatePlaylist());

        // Dynamic Liked core hearts
        document.getElementById('current-player-heart').addEventListener('click', () => {
            this.toggleLikeSong(this.ac.currentTrackIndex);
        });

        // Close dropdown Context-menu when clicking anywhere else
        document.addEventListener('click', () => {
            document.getElementById('song-context-menu').style.display = 'none';
        });

        // Queue drawer triggers
        document.getElementById('ctrl-queue').addEventListener('click', () => this.toggleQueueDrawer());
        document.getElementById('close-queue-btn').addEventListener('click', () => this.toggleQueueDrawer(false));
        document.getElementById('clear-queue-btn').addEventListener('click', () => {
            this.queue = [];
            this.renderQueueDrawer();
            this.showToast("Queue cleared");
        });

        // Keyboard triggers banner
        document.getElementById('shortcuts-trigger').addEventListener('click', () => this.toggleShortcutsModal(true));
        document.getElementById('close-modal-btn').addEventListener('click', () => this.toggleShortcutsModal(false));
        document.getElementById('shortcuts-modal').addEventListener('click', (e) => {
            if (e.target.id === 'shortcuts-modal') this.toggleShortcutsModal(false);
        });
    }

    updateVolumeUI(vol) {
        const btn = document.getElementById('ctrl-mute');
        if (vol === 0) {
            btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else if (vol < 0.3) {
            btn.innerHTML = '<i class="fa-solid fa-volume-off"></i>';
        } else if (vol < 0.7) {
            btn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    }

    // ==========================================
    // KEYBOARD SHORTCUT SYSTEMS
    // ==========================================
    bindShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore keypresses if user is typing inside search bar
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            const key = e.key.toLowerCase();
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.ac.togglePlay();
                this.showToast(this.ac.isPlaying ? "Played" : "Paused");
            } else if (key === 'arrowright') {
                e.preventDefault();
                const seekTo = Math.min(this.ac.audio.currentTime + 10, this.ac.audio.duration || 0);
                this.ac.seek(seekTo);
                this.showToast("Fast forward +10s");
            } else if (key === 'arrowleft') {
                e.preventDefault();
                const seekTo = Math.max(this.ac.audio.currentTime - 10, 0);
                this.ac.seek(seekTo);
                this.showToast("Rewind -10s");
            } else if (key === 'n') {
                this.playNextInContext();
                this.showToast("Next track");
            } else if (key === 'p') {
                this.ac.prev(this.getActiveContextIndices());
                this.showToast("Previous track");
            } else if (key === 'm') {
                const volSlider = document.getElementById('volume-slider');
                const updatedVol = this.ac.toggleMute(this.lastVolume);
                volSlider.value = updatedVol * 100;
                volSlider.style.background = `linear-gradient(to right, var(--text-main) 0%, var(--text-main) ${volSlider.value}%, #4f4f4f ${volSlider.value}%, #4f4f4f 100%)`;
                this.updateVolumeUI(updatedVol);
                this.showToast(updatedVol === 0 ? "Muted" : "Unmuted");
            } else if (key === 'l') {
                this.toggleLikeSong(this.ac.currentTrackIndex);
            } else if (key === 'k') {
                const isOpen = document.getElementById('shortcuts-modal').classList.contains('open');
                this.toggleShortcutsModal(!isOpen);
            } else if (key === 'q') {
                this.toggleQueueDrawer();
            }
        });
    }

    toggleShortcutsModal(open) {
        document.getElementById('shortcuts-modal').classList.toggle('open', open);
    }

    toggleQueueDrawer(forceState = null) {
        const drawer = document.getElementById('queue-drawer');
        const isOpen = drawer.classList.contains('open');
        const nextState = forceState !== null ? forceState : !isOpen;
        
        drawer.classList.toggle('open', nextState);
        this.renderQueueDrawer();
    }

    showToast(message) {
        const toast = document.getElementById('toast-banner');
        toast.textContent = message;
        toast.className = "toast-notification show";
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.className = "toast-notification";
        }, 2000);
    }

    // ==========================================
    // VIEW SWITCH NAVIGATION
    // ==========================================
    switchView(viewName, customPlaylistId = null, pushToHistory = true) {
        if (pushToHistory) {
            // Cut off any forward history if we are currently at a middle point and navigate to a new page
            if (this.historyPointer < this.historyStack.length - 1) {
                this.historyStack = this.historyStack.slice(0, this.historyPointer + 1);
            }
            this.historyStack.push({ viewName, customPlaylistId });
            this.historyPointer++;
        }

        this.activeView = viewName;
        this.activeCustomPlaylistId = customPlaylistId;

        this.updateNavigationArrows();

        // Reset navigation highlights
        document.getElementById('nav-home').classList.remove('active');
        document.getElementById('nav-search').classList.remove('active');
        document.getElementById('playlist-liked-item').classList.remove('active');
        document.getElementById('playlist-recent-item').classList.remove('active');
        document.querySelectorAll('.playlist-item').forEach(item => item.classList.remove('active'));

        // Hide search inputs by default
        document.getElementById('header-search-container').style.display = "none";

        // Hide all sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active-view');
        });

        // Set contextual updates
        if (viewName === 'home') {
            document.getElementById('nav-home').classList.add('active');
            document.getElementById('home-view').classList.add('active-view');
            this.renderHomeView();
        } else if (viewName === 'search') {
            document.getElementById('nav-search').classList.add('active');
            document.getElementById('search-view').classList.add('active-view');
            document.getElementById('header-search-container').style.display = "block";
            document.getElementById('search-query').focus();
            this.renderSearchQuery(document.getElementById('search-query').value);
        } else if (viewName === 'liked') {
            document.getElementById('playlist-liked-item').classList.add('active');
            document.getElementById('liked-songs-view').classList.add('active-view');
            this.renderLikedView();
        } else if (viewName === 'recent') {
            document.getElementById('playlist-recent-item').classList.add('active');
            document.getElementById('recently-played-view').classList.add('active-view');
            this.renderRecentView();
        } else if (viewName === 'custom-playlist' && customPlaylistId) {
            const item = document.getElementById(`playlist-item-${customPlaylistId}`);
            if (item) item.classList.add('active');
            document.getElementById('custom-playlist-view').classList.add('active-view');
            this.renderCustomPlaylistView(customPlaylistId);
        }
    }

    updateNavigationArrows() {
        const backBtn = document.getElementById('header-back-btn');
        const forwardBtn = document.getElementById('header-forward-btn');
        
        if (backBtn && forwardBtn) {
            if (this.historyPointer > 0) {
                backBtn.style.opacity = '1';
                backBtn.style.cursor = 'pointer';
                backBtn.disabled = false;
            } else {
                backBtn.style.opacity = '0.5';
                backBtn.style.cursor = 'not-allowed';
                backBtn.disabled = true;
            }
            
            if (this.historyPointer < this.historyStack.length - 1) {
                forwardBtn.style.opacity = '1';
                forwardBtn.style.cursor = 'pointer';
                forwardBtn.disabled = false;
            } else {
                forwardBtn.style.opacity = '0.5';
                forwardBtn.style.cursor = 'not-allowed';
                forwardBtn.disabled = true;
            }
        }
    }

    goBack() {
        if (this.historyPointer > 0) {
            this.historyPointer--;
            const state = this.historyStack[this.historyPointer];
            this.switchView(state.viewName, state.customPlaylistId, false);
        }
    }

    goForward() {
        if (this.historyPointer < this.historyStack.length - 1) {
            this.historyPointer++;
            const state = this.historyStack[this.historyPointer];
            this.switchView(state.viewName, state.customPlaylistId, false);
        }
    }

    // ==========================================
    // RENDER FUNCTIONS - HOME
    // ==========================================
    renderHomeView() {
        this.renderGreeting();
        this.renderSongsCardGrid();
        this.renderHomeTracksList();
        this.renderHomeRecentlyPlayed();
    }

    renderGreeting() {
        const hours = new Date().getHours();
        let greeting = "Good afternoon";
        if (hours < 12) greeting = "Good morning";
        else if (hours >= 18) greeting = "Good evening";
        document.getElementById('greeting').textContent = greeting;
    }

    renderSongsCardGrid() {
        const container = document.getElementById('songs-card-grid');
        container.innerHTML = "";
        
        songs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = "song-card";
            card.onclick = () => {
                if (this.ac.currentTrackIndex === index && this.activeContext === 'all') {
                    this.ac.togglePlay();
                } else {
                    this.activeContext = 'all';
                    this.rebuildQueue();
                    this.ac.loadSong(index, true);
                }
            };

            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${song.cover}" alt="">
                    <button class="card-play-btn" onclick="event.stopPropagation(); window.ui.playSongFromCard(${index})">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </div>
                <div class="card-info">
                    <div class="card-title">${song.title}</div>
                    <div class="card-artist">${song.artist}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    playSongFromCard(index) {
        if (this.ac.currentTrackIndex === index && this.activeContext === 'all') {
            this.ac.togglePlay();
        } else {
            this.activeContext = 'all';
            this.rebuildQueue();
            this.ac.loadSong(index, true);
        }
    }

    renderHomeTracksList() {
        const list = document.getElementById('home-track-list');
        this.buildTracksTable(list, songs.map((_, i) => i), 'all');
    }

    renderHomeRecentlyPlayed() {
        const section = document.getElementById('recently-played-home-section');
        const grid = document.getElementById('recently-played-card-grid');
        
        if (this.recentlyPlayed.length === 0) {
            section.style.display = "none";
            return;
        }

        section.style.display = "block";
        grid.innerHTML = "";

        // Limit grid to first 4 items
        const displayed = this.recentlyPlayed.slice(0, 4);
        displayed.forEach(songIndex => {
            const song = songs[songIndex];
            const card = document.createElement('div');
            card.className = "song-card";
            card.onclick = () => {
                if (this.ac.currentTrackIndex === songIndex && this.activeContext === 'recent') {
                    this.ac.togglePlay();
                } else {
                    this.activeContext = 'recent';
                    this.rebuildQueue();
                    this.ac.loadSong(songIndex, true);
                }
            };

            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${song.cover}" alt="">
                    <button class="card-play-btn" onclick="event.stopPropagation(); window.ui.playRecentCard(${songIndex})">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </div>
                <div class="card-info">
                    <div class="card-title">${song.title}</div>
                    <div class="card-artist">${song.artist}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    playRecentCard(index) {
        if (this.ac.currentTrackIndex === index && this.activeContext === 'recent') {
            this.ac.togglePlay();
        } else {
            this.activeContext = 'recent';
            this.rebuildQueue();
            this.ac.loadSong(index, true);
        }
    }

    // ==========================================
    // RENDER FUNCTIONS - SEARCH
    // ==========================================
    renderSearchQuery(query) {
        const list = document.getElementById('search-track-list');
        
        if (!query || query.trim() === "") {
            document.getElementById('search-results-container').style.display = "none";
            document.getElementById('search-results-empty').style.display = "none";
            document.getElementById('search-browse-categories').style.display = "block";
            return;
        }

        document.getElementById('search-browse-categories').style.display = "none";

        const term = query.toLowerCase().trim();
        const filteredIndices = songs
            .map((s, idx) => ({ s, idx }))
            .filter(item => item.s.title.toLowerCase().includes(term) || item.s.artist.toLowerCase().includes(term))
            .map(item => item.idx);

        if (filteredIndices.length === 0) {
            document.getElementById('search-results-container').style.display = "none";
            document.getElementById('search-results-empty').style.display = "block";
            return;
        }

        document.getElementById('search-results-container').style.display = "block";
        document.getElementById('search-results-empty').style.display = "none";

        this.buildTracksTable(list, filteredIndices, 'all');
    }

    // ==========================================
    // RENDER FUNCTIONS - LIKED SONGS
    // ==========================================
    renderLikedView() {
        const list = document.getElementById('liked-track-list');
        const container = document.getElementById('liked-tracks-container');
        const empty = document.getElementById('liked-empty-state');
        const row = document.getElementById('liked-action-row');

        if (this.likedSongs.length === 0) {
            container.style.display = "none";
            row.style.display = "none";
            empty.style.display = "flex";
            return;
        }

        container.style.display = "block";
        row.style.display = "flex";
        empty.style.display = "none";

        // Draw headers and play status
        const playBtn = document.getElementById('liked-play-btn');
        if (this.activeContext === 'liked' && this.ac.isPlaying) {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }

        this.buildTracksTable(list, this.likedSongs, 'liked');
        document.getElementById('liked-count-meta').textContent = this.likedSongs.length;
    }

    toggleLikeSong(index) {
        const songIndex = parseInt(index);
        const pos = this.likedSongs.indexOf(songIndex);
        
        if (pos === -1) {
            this.likedSongs.push(songIndex);
            this.showToast("Saved to Liked Songs");
        } else {
            this.likedSongs.splice(pos, 1);
            this.showToast("Removed from Liked Songs");
        }

        this.saveState('spotify_liked_songs', this.likedSongs);
        
        // Dynamic re-render active sections
        if (this.activeView === 'liked') this.renderLikedView();
        else if (this.activeView === 'home') this.renderHomeView();
        
        // Re-sync current player hearts
        if (this.ac.currentTrackIndex === songIndex) {
            this.ac.loadSong(songIndex, this.ac.isPlaying);
        }
    }

    // ==========================================
    // RENDER FUNCTIONS - RECENTLY PLAYED
    // ==========================================
    renderRecentView() {
        const list = document.getElementById('recent-track-list');
        const container = document.getElementById('recent-tracks-container');
        const empty = document.getElementById('recent-empty-state');
        const row = document.getElementById('recent-action-row');

        if (this.recentlyPlayed.length === 0) {
            container.style.display = "none";
            row.style.display = "none";
            empty.style.display = "flex";
            return;
        }

        container.style.display = "block";
        row.style.display = "flex";
        empty.style.display = "none";

        // Draw play status
        const playBtn = document.getElementById('recent-play-btn');
        if (this.activeContext === 'recent' && this.ac.isPlaying) {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }

        this.buildTracksTable(list, this.recentlyPlayed, 'recent');
        document.getElementById('recent-count-meta').textContent = this.recentlyPlayed.length;
    }

    // ==========================================
    // RENDER FUNCTIONS - CUSTOM PLAYLISTS
    // ==========================================
    handleCreatePlaylist() {
        const name = prompt("Enter a name for your new playlist:");
        if (!name || name.trim() === "") return;

        const id = 'playlist_' + Date.now();
        const newPlaylist = {
            id: id,
            name: name.trim(),
            songIndices: []
        };

        this.customPlaylists.push(newPlaylist);
        this.saveState('spotify_custom_playlists', this.customPlaylists);
        
        this.renderAllPlaylistsSidebar();
        this.showToast(`Playlist "${name}" created!`);
        this.switchView('custom-playlist', id);
    }

    renderAllPlaylistsSidebar() {
        const container = document.getElementById('sidebar-playlists-list');
        
        // Remove previous custom elements first
        container.querySelectorAll('.playlist-custom-item').forEach(el => el.remove());

        this.customPlaylists.forEach(playlist => {
            const li = document.createElement('li');
            li.className = "playlist-item playlist-custom-item";
            li.id = `playlist-item-${playlist.id}`;
            li.onclick = () => this.switchView('custom-playlist', playlist.id);

            li.innerHTML = `
                <div class="playlist-img-placeholder custom">
                    <i class="fa-solid fa-music"></i>
                </div>
                <div class="playlist-info">
                    <h5>${playlist.name}</h5>
                    <p>Playlist • <span>${playlist.songIndices.length}</span> songs</p>
                </div>
            `;
            container.appendChild(li);
        });
    }

    renderCustomPlaylistView(playlistId) {
        const playlist = this.customPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        document.getElementById('custom-playlist-title').textContent = playlist.name;
        document.getElementById('custom-playlist-count-meta').textContent = playlist.songIndices.length;

        const list = document.getElementById('custom-playlist-track-list');
        const container = document.getElementById('custom-playlist-tracks-container');
        const empty = document.getElementById('custom-playlist-empty-state');
        const actionRow = document.getElementById('custom-playlist-action-row');

        if (playlist.songIndices.length === 0) {
            container.style.display = "none";
            empty.style.display = "flex";
        } else {
            container.style.display = "block";
            empty.style.display = "none";
            this.buildTracksTable(list, playlist.songIndices, `playlist-${playlist.id}`);
        }

        // Action play trigger setup
        const playBtn = document.getElementById('custom-playlist-play-btn');
        if (this.activeContext === `playlist-${playlist.id}` && this.ac.isPlaying) {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }

        playBtn.onclick = () => {
            if (playlist.songIndices.length === 0) return;
            const targetContext = `playlist-${playlist.id}`;
            if (this.activeContext === targetContext && playlist.songIndices.includes(this.ac.currentTrackIndex)) {
                this.ac.togglePlay();
            } else {
                this.activeContext = targetContext;
                this.rebuildQueue();
                this.ac.loadSong(playlist.songIndices[0], true);
            }
        };

        // Delete Playlist Setup
        const delBtn = document.getElementById('delete-playlist-btn');
        delBtn.onclick = () => {
            if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                this.customPlaylists = this.customPlaylists.filter(p => p.id !== playlistId);
                this.saveState('spotify_custom_playlists', this.customPlaylists);
                this.renderAllPlaylistsSidebar();
                this.showToast(`Deleted "${playlist.name}"`);
                this.switchView('home');
            }
        };
    }

    addSongToPlaylist(playlistId, songIndex) {
        const playlist = this.customPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        const idx = parseInt(songIndex);
        if (playlist.songIndices.includes(idx)) {
            this.showToast(`Already added to "${playlist.name}"`);
            return;
        }

        playlist.songIndices.push(idx);
        this.saveState('spotify_custom_playlists', this.customPlaylists);
        this.renderAllPlaylistsSidebar();
        
        if (this.activeView === 'custom-playlist' && this.activeCustomPlaylistId === playlistId) {
            this.renderCustomPlaylistView(playlistId);
        }

        this.showToast(`Added to "${playlist.name}"`);
    }

    removeSongFromCustomPlaylist(playlistId, songIndex) {
        const playlist = this.customPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        playlist.songIndices = playlist.songIndices.filter(i => i !== parseInt(songIndex));
        this.saveState('spotify_custom_playlists', this.customPlaylists);
        this.renderAllPlaylistsSidebar();
        this.renderCustomPlaylistView(playlistId);
        this.showToast("Song removed from playlist");
    }

    // ==========================================
    // RENDER FUNCTIONS - PLAY QUEUE DRAWER
    // ==========================================
    renderQueueDrawer() {
        const nowPlayingBox = document.getElementById('queue-now-playing-box');
        const upcomingList = document.getElementById('queue-upcoming-list');

        // Draw Now Playing Detail
        const currentSong = songs[this.ac.currentTrackIndex];
        nowPlayingBox.innerHTML = `
            <div class="track-row" style="padding: 4px; border-radius: 4px;">
                <div class="track-title-container" style="gap: 12px;">
                    <img src="${currentSong.cover}" style="width:36px; height:36px;" alt="">
                    <div>
                        <div class="track-name" style="font-size:14px; color:var(--spotify-green);">${currentSong.title}</div>
                        <div class="track-artist" style="font-size:12px;">${currentSong.artist}</div>
                    </div>
                </div>
            </div>
        `;

        // Draw Upcoming Lists
        upcomingList.innerHTML = "";
        if (this.queue.length === 0) {
            upcomingList.innerHTML = `<div style="font-size:13px; color:var(--text-muted); text-align:center; padding:16px;">Queue is empty</div>`;
            return;
        }

        this.queue.forEach((songIndex, uiIndex) => {
            const song = songs[songIndex];
            const div = document.createElement('div');
            div.className = "track-row";
            div.innerHTML = `
                <div style="font-size:12px; color:var(--text-muted);">${uiIndex + 1}</div>
                <div class="track-title-container" style="gap: 12px; min-width: 0;">
                    <img src="${song.cover}" style="width:36px; height:36px;" alt="">
                    <div style="min-width: 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        <div class="track-name" style="font-size:14px; color:var(--text-main);">${song.title}</div>
                        <div class="track-artist" style="font-size:12px;">${song.artist}</div>
                    </div>
                </div>
                <div>
                    <button class="track-like-btn" onclick="event.stopPropagation(); window.ui.removeFromQueue(${uiIndex})" title="Remove from queue" style="opacity:1;">
                        <i class="fa-solid fa-trash-can" style="font-size:12px;"></i>
                    </button>
                </div>
                <div class="track-duration" style="font-size:12px;">${song.staticDuration}</div>
            `;
            upcomingList.appendChild(div);
        });
    }

    removeFromQueue(uiIndex) {
        this.queue.splice(uiIndex, 1);
        this.renderQueueDrawer();
        this.showToast("Removed from queue");
    }

    // ==========================================
    // DYNAMIC TABLE ROW CREATOR ENGINE
    // ==========================================
    buildTracksTable(parentElement, indicesArray, contextName) {
        parentElement.innerHTML = "";

        indicesArray.forEach((songIndex, uiIndex) => {
            const song = songs[songIndex];
            const isLiked = this.likedSongs.includes(songIndex);
            
            const row = document.createElement('div');
            row.className = `track-row ${this.ac.currentTrackIndex === songIndex ? 'active-track' : ''}`;
            row.setAttribute('data-index', songIndex);
            
            // Primary cell clicks (trigger song loading)
            row.onclick = () => {
                this.activeContext = contextName;
                this.rebuildQueue();
                
                if (this.ac.currentTrackIndex === songIndex) {
                    this.ac.togglePlay();
                } else {
                    this.ac.loadSong(songIndex, true);
                }
            };

            // Custom dynamic columns
            row.innerHTML = `
                <div class="track-number-container" style="display:flex; align-items:center;">
                    <span class="track-number">${uiIndex + 1}</span>
                    <span class="track-play-icon"><i class="fa-solid fa-play"></i></span>
                    <div class="equalizer-icon">
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                        <span class="equalizer-bar"></span>
                    </div>
                </div>
                <div class="track-title-container">
                    <img src="${song.cover}" alt="">
                    <div>
                        <div class="track-name">${song.title}</div>
                        <div class="track-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="track-album">${song.album}</div>
                <div style="display:flex; align-items:center; gap:16px;">
                    <button class="track-like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); window.ui.toggleLikeSong(${songIndex})">
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <!-- Trigger Absolute context dropdown on right clicks/three dots -->
                    <button class="track-like-btn" onclick="event.stopPropagation(); window.ui.handleDropdownTrigger(event, ${songIndex})" style="font-size:15px;" title="Options">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                </div>
                <div class="track-duration">${song.staticDuration}</div>
            `;
            parentElement.appendChild(row);
        });

        this.updateActiveTrackHighlightStyles();
    }

    handleDropdownTrigger(e, songIndex) {
        e.preventDefault();
        this.showPlaylistContextMenu(e, songIndex);
    }

    showPlaylistContextMenu(e, songIndex) {
        const menu = document.getElementById('song-context-menu');
        const anchor = document.getElementById('context-playlists-anchor');
        
        this.contextMenuIndex = parseInt(songIndex);
        
        // Position contextual dialog cleanly
        menu.style.display = 'block';
        menu.style.left = `${e.pageX - 180}px`;
        menu.style.top = `${e.pageY + 10}px`;

        // Re-sync standard context item text
        const isLiked = this.likedSongs.includes(this.contextMenuIndex);
        const likeItem = document.getElementById('context-menu-like-toggle');
        likeItem.innerHTML = `
            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isLiked ? 'color:var(--spotify-green)' : ''}"></i>
            <span>${isLiked ? 'Remove from Liked' : 'Add to Liked Songs'}</span>
        `;
        likeItem.onclick = () => {
            this.toggleLikeSong(this.contextMenuIndex);
            menu.style.display = 'none';
        };

        // Populate Custom playlist options
        anchor.innerHTML = "";
        
        // Show option to remove if view is custom playlist itself
        if (this.activeView === 'custom-playlist' && this.activeCustomPlaylistId) {
            const remItem = document.createElement('li');
            remItem.className = "context-menu-item";
            remItem.innerHTML = `
                <i class="fa-solid fa-trash-can" style="color:#ff4444;"></i>
                <span style="color:#ff4444;">Remove from this Playlist</span>
            `;
            remItem.onclick = () => {
                this.removeSongFromCustomPlaylist(this.activeCustomPlaylistId, this.contextMenuIndex);
                menu.style.display = 'none';
            };
            anchor.appendChild(remItem);
        }

        if (this.customPlaylists.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = "context-menu-item";
            emptyItem.style.color = "var(--text-muted)";
            emptyItem.style.cursor = "default";
            emptyItem.textContent = "No playlists created";
            anchor.appendChild(emptyItem);
            return;
        }

        this.customPlaylists.forEach(playlist => {
            const li = document.createElement('li');
            li.className = "context-menu-item";
            li.innerHTML = `
                <i class="fa-solid fa-list-ul"></i>
                <span>${playlist.name}</span>
            `;
            li.onclick = () => {
                this.addSongToPlaylist(playlist.id, this.contextMenuIndex);
                menu.style.display = 'none';
            };
            anchor.appendChild(li);
        });
    }

    // Dynamic color overlays & animated visualizer highlights
    updateActiveTrackHighlightStyles() {
        document.querySelectorAll('.track-row').forEach(row => {
            const index = parseInt(row.getAttribute('data-index'));
            const eq = row.querySelector('.equalizer-icon');
            const num = row.querySelector('.track-number');

            if (index === this.ac.currentTrackIndex) {
                row.classList.add('active-track');
                if (this.ac.isPlaying) {
                    row.classList.add('playing-track');
                    if (eq) eq.style.display = 'flex';
                    if (num) num.style.display = 'none';
                } else {
                    row.classList.remove('playing-track');
                    if (eq) eq.style.display = 'none';
                    if (num) num.style.display = 'flex';
                }
            } else {
                row.classList.remove('active-track');
                row.classList.remove('playing-track');
                if (eq) eq.style.display = 'none';
                if (num) num.style.display = 'flex';
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Global initialization triggers
window.addEventListener('DOMContentLoaded', () => {
    const audioEl = document.getElementById('audio-element');
    
    // Core controllers bootstrap
    window.audioController = new AudioController(audioEl);
    window.ui = new UIController(window.audioController);
    
    window.ui.init();
});

// Exposed global callbacks for inline HTML play triggers
window.playAllFromStart = function() {
    const targetContext = 'all';
    if (window.ui.activeContext === targetContext) {
        window.audioController.togglePlay();
    } else {
        window.ui.activeContext = targetContext;
        window.ui.rebuildQueue();
        window.audioController.loadSong(0, true);
    }
};

window.playAllLiked = function() {
    if (window.ui.likedSongs.length > 0) {
        const targetContext = 'liked';
        if (window.ui.activeContext === targetContext && window.ui.likedSongs.includes(window.audioController.currentTrackIndex)) {
            window.audioController.togglePlay();
        } else {
            window.ui.activeContext = targetContext;
            window.ui.rebuildQueue();
            window.audioController.loadSong(window.ui.likedSongs[0], true);
        }
    }
};

window.playAllRecent = function() {
    if (window.ui.recentlyPlayed.length > 0) {
        const targetContext = 'recent';
        if (window.ui.activeContext === targetContext && window.ui.recentlyPlayed.includes(window.audioController.currentTrackIndex)) {
            window.audioController.togglePlay();
        } else {
            window.ui.activeContext = targetContext;
            window.ui.rebuildQueue();
            window.audioController.loadSong(window.ui.recentlyPlayed[0], true);
        }
    }
};

window.switchView = function(viewName, playlistId = null) {
    window.ui.switchView(viewName, playlistId);
};
