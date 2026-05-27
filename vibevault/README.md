# 🎧 VibeVault - Premium Offline Cyberpunk Music Player

**VibeVault** is a production-level, fully offline music streaming web application designed with a dark futuristic cyberpunk aesthetic, featuring dynamic neon green and purple accents, glassmorphism panels, and smooth custom transitions.

> 🌟 **Tagline**: *“No Ads. No Internet. Just Music.”*

---

## ✨ Design & Visual Polish
- **Futuristic Cyber-Glass Theme**: Frosted glass panels layered over dynamic shifting background radial glows.
- **Dynamic Backdrop Glows**: Shifting background radial shadows that dynamically analyze and match the dominant cover colors of the active song.
- **Canvas Waveform Visualizer**: Smooth, real-time frequency visualizer painted dynamically on an HTML5 `<canvas>` next to media controls inside the play bar.
- **Breathe Micro-Animations**: Interactive cards with scale lifts, rotating CDs, and CSS-bouncing equalizer bars visible on playing tracks.

---

## 🚀 Key Functional Systems

### 1. IndexedDB Offline Vault Storage
- Stored entirely inside the browser's local **IndexedDB** engine—zero bandwidth cost, zero server hosting, and zero telemetry tracking.
- Audio tracks are securely serialized and saved as raw binary **Blobs**, meaning you never need internet access after uploading a track.
- Databases separate stores into:
  - `songs`: Holds files, metadata parameters, and base64 cover art.
  - `playlists`: Indexes custom compiling structures.
  - `settings`: Saves volume coefficients, favorite lists, dynamic histories, and themes.

### 2. Howler.js Audio Integration
- Integrates the `howler` playback manager to coordinate loops, shuffle lists, and seek timeline updates.
- Wires dynamic Object URLs (`URL.createObjectURL(blob)`) to Web Audio API sound buffers, allowing full frequency stream hooks.
- **Sleep Timer Countdowns**: Dynamic interval timers that track time and trigger smooth audio fades and play pauses upon hitting `0`.

### 3. Integrated Catalog Preloading
- If the application launches with an empty database, a built-in preloader automatically fetches and saves the four high-fidelity cyber/lofi local files from the project directory.
- Users can instantly preview and play these tracks without any manual configuration, while retaining full access to upload their own files!

---

## 🎹 Keyboard Shortcuts Guide
Focus anywhere on the player and press these keys:

| Key Trigger | Action Completed |
| :---: | :--- |
| **`Spacebar`** | Toggle Play / Pause |
| **`ArrowRight`** | Fast-forward active track by `+10 seconds` |
| **`ArrowLeft`** | Rewind active track by `-10 seconds` |
| **`Q` / `q`** | Toggle sidebar collapse |
| **`M` / `m`** | Toggle Mute / Unmute volume |
| **`L` / `l`** | Save or remove the currently playing song from Favorites |

---

## 📁 Project Layout
```text
d:/Spotify web/vibevault/
├── package.json
├── tailwind.config.js    # Custom cyberpunk neon emerald/purple theme extends
├── postcss.config.js
├── vite.config.js
├── index.html            # Geometric Google font links and metadata
├── README.md             # This guide
└── src/
    ├── main.jsx
    ├── App.jsx            # Dynamic visualizer, sleep timers, database preloader, shortcuts
    ├── index.css          # Customized scrollbars, glass utilities, breathing animation keyframes
    ├── db/
    │   └── indexedDB.js   # DB schema, blob save/read systems, settings persistence
    └── components/
        ├── Sidebar.jsx          # Collapsible navigations & playlists list
        ├── MainContent.jsx      # Dynamic views, search inputs, songs catalogs
        ├── MusicPlayer.jsx      # Canvas audio waveform frequency bars & player bar
        ├── UploadZone.jsx       # Drag and drop files upload zone
        ├── SleepTimerModal.jsx  # Configurable countdown sleep timers
        └── Toast.jsx            # Neon warning alert popups
```

---

## 🛠️ Installation & Running Locally

Ensure you have **Node.js** (v18+) installed, then execute:

```bash
# 1. Navigate to the project directory
cd vibevault

# 2. Start the local Vite developer server
npm run dev
```

Navigate to **`http://localhost:5173`** in your browser.
Drag and drop your own `.mp3` or `.wav` tracks, watch the visualizer bounce, set a sleep timer, and experience pure offline desktop-quality music!
