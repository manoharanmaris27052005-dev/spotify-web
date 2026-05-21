# 🎧 Spotify Premium Clone - Cinematic Web Player

A production-level, highly interactive, and cinematic Spotify-inspired music streaming web application. Built entirely with **Semantic HTML**, **Vanilla CSS**, and **Modular JavaScript** (ES6+), it mirrors the authentic behavior, aesthetics, and premium interactions of the desktop and mobile Spotify Web Players.

---

## ✨ Design & Aesthetic Philosophy
The visual layout is designed to **WOW** at first glance, featuring:
- **Cinematic Dark Theme**: Harmonious deep-black and HSL-based charcoal grey palette with iconic Spotify Green (`#1DB954`) accent colors.
- **Glassmorphism**: Premium frosted-glass overlays, blur backdrops (`backdrop-filter`), and micro-shadow elevations on active panels.
- **Equalizer Animations**: Bouncing CSS-bouncing bar visualizers running dynamically next to song titles in tracklists and in the bottom controller bar when music plays.
- **Micro-Interactions**: Smooth scale expansions on hover, slide reveals of play buttons on grid cards, customized responsive scrollbars, and glowing volume/seek sliders.
- **Page Loading Experience**: Smooth, glowing green pulse logo fading out seamlessly once the DOM is fully loaded and ready for interaction.

---

## 🚀 Key Functional Systems

### 1. Centralized Decoupled Architecture
The JavaScript engine inside `app.js` is structured into two clean classes to separate responsibilities:
- **`AudioController`**: Coordinates the native HTML5 Audio API, playback state hooks, triple-state loop controls, shuffle state matrices, and auto-progression algorithms.
- **`UIController`**: Manages user input bindings, view router stacks (enabling Back/Forward navigation history), local storage persistence, context menus, drag scrubbing, and DOM rendering.

### 2. Multi-Panel Responsive Grid Layout
- **Left Sidebar**: Controls global search, home browsing, Your Library lists, and instant custom playlist creations.
- **Top Header**: Hosts dynamic time-based greetings ("Good morning/afternoon/evening"), Back/Forward history navigation chevrons, user profiles, and active search input boxes.
- **Main View Panels**: Fluidly displays grids of home albums, interactive categories, or list tables depending on the selected view.
- **Right Slide-out Queue Panel**: Shows the track currently playing and lists upcoming tracks in the queue. Allows dynamic removal or complete clearing.
- **Bottom Player Bar**: Fixed dashboard housing the progress timeline, volume sliders, track information, like toggles, and state triggers.

### 3. Smart Timeline & Volume Scrubbing
- **Stutter-Free Draggable Seeker**: Uses a pointer flag lock (`isDraggingProgress`) to decouple seek operations. Programmatic timeline updates are paused while the user actively drags the slider, providing smooth visual scrolling. The playback location only updates when the pointer is released (`change`).
- **Dynamic Gradient Fills**: Sliders dynamically color their filled track area (green for seeker, white for volume) and fade-in their circular thumbs upon mouse hover.
- **Volume & Mute Alignment**: Syncs the initial volume state to 80% with correct colors and tracks the last volume level, allowing the mute toggle button to restore the previous sound level accurately.

### 4. Dynamic Playlists & Context Options
- **LocalStorage Data Persistence**: Automatically saves and restores Liked Songs, Custom Playlists, and Recently Played histories.
- **Interactive Context Menus**: Right-clicking or clicking the three-dot button (`fa-ellipsis`) on any song opens a custom context menu. Users can like the song, add it to any custom playlist, or remove it from the current playlist context.
- **History Tracking**: Tracks Recently Played tracks when playback starts, displaying the last four songs played on the Home Dashboard under a dedicated section.

---

## 🎨 Creative Assets & Song Mapping

All audio tracks are mapped to high-quality cinematic artwork files pre-seeded in the project:
1. **Midnight Breeze** — *Lofi Echoes* (Album: *Urban Nocturnes*) | `images/cover1.png`
2. **Neon Dreams** — *Synthwave Cruiser* (Album: *Retro Drive*) | `images/cover2.png`
3. **Golden Hour** — *Acoustic Horizon* (Album: *Sunset Whispers*) | `images/cover3.png`
4. **Electric Pulse** — *Digital Mirage* (Album: *Cybernetic Heart*) | `images/cover4.png`

---

## 🎹 Keyboard Shortcuts Guide
Open the guide anywhere in the application by clicking the **Keyboard Shortcuts (K)** banner in the sidebar or pressing `K`.

| Key Trigger | Action Triggered |
| :---: | :--- |
| **`Spacebar`** | Toggle Play / Pause state |
| **`ArrowRight`** | Fast-forward active track by `+10 seconds` |
| **`ArrowLeft`** | Rewind active track by `-10 seconds` |
| **`N` / `n`** | Skip to next track in active context |
| **`P` / `p`** | Skip to previous track (or restart song) |
| **`M` / `m`** | Toggle Mute / Unmute volume |
| **`L` / `l`** | Save or remove the currently playing song from Liked Songs |
| **`Q` / `q`** | Open or close the slide-out Play Queue Panel |
| **`K` / `k`** | Open or close the Keyboard Shortcuts Overlay |

*Note: Keyboard shortcuts are automatically disabled when typing inside search inputs to prevent accidental triggers.*

---

## 🛠️ Installation & Local Run

### Method 1: Local File Open
Since the application is built on pure static client-side web technologies, you can run it instantly:
1. Open the project folder.
2. Double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local HTTP Server (Recommended)
To ensure optimal performance of HTML5 audio preload states and prevent browser CORS warnings, run the application through a local web server:

**Using Node.js (`npx`):**
```bash
# Run a live-reloading static server inside the directory
npx live-server
```
*or*
```bash
npx serve .
```

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 📁 File Structure
```text
d:/Spotify web/
├── index.html       # Semantic layout, banners, drawers & modals
├── style.css        # Premium stylesheets, breathing layouts & bouncing visualizers
├── app.js           # Decoupled ES6 controller architecture & localstorage hooks
├── songs/           # Directory containing MP4 audio source tracks
└── images/          # Preloaded cinematic album artwork covers (PNG format)
```

---

## 🌟 Verification & UX Polish
- **Preload Safeguard**: Automatically preloads the first song on launch to display artwork and duration while adhering to browser autoplay policies.
- **Decoupled Event Triggers**: Completely avoids duplicate event listeners to prevent playback bugs.
- **Empty-State UI Layouts**: Features custom search categories, empty Liked list suggestions, and a custom folder manager that displays clean empty states when playlists are empty.
