import React, { useState, useRef } from 'react';
import { Upload, Music, Image as ImageIcon, Plus, Disc, CheckCircle } from 'lucide-react';
import { saveSong, getAllSongs } from '../db/indexedDB';

const UploadZone = ({ onUploadSuccess, addToast }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Metadata fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [cover, setCover] = useState(''); // Base64 album art

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const parseFileName = (fileName) => {
    // Strip extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split(' - ');
    if (parts.length > 1) {
      return { artist: parts[0].trim(), title: parts[1].trim() };
    }
    return { artist: 'Unknown Artist', title: nameWithoutExt.trim() };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        handleFileSelect(file);
      } else {
        addToast('Please select a valid audio file!', 'error');
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const parsed = parseFileName(file.name);
    setTitle(parsed.title);
    setArtist(parsed.artist);
    setAlbum('Offline Vault');
    setCover('');
  };

  // Convert Cover Image to base64
  const handleCoverSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCover(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get Audio Duration
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const existingSongs = await getAllSongs();
      const isDuplicate = existingSongs.some(s => 
        s.title.toLowerCase() === (title || 'Unknown Title').toLowerCase() && 
        s.artist.toLowerCase() === (artist || 'Unknown Artist').toLowerCase()
      );

      if (isDuplicate) {
        addToast(`"${title || 'Unknown Title'}" already exists in vault!`, 'error');
        setUploading(false);
        return;
      }

      const durationSeconds = await getAudioDuration(selectedFile);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = Math.floor(durationSeconds % 60);
      const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      const songData = {
        file: selectedFile,
        title: title || 'Unknown Title',
        artist: artist || 'Unknown Artist',
        album: album || 'Unknown Album',
        duration: durationStr || '3:00',
        cover: cover || '', // Store base64 cover
        addedAt: Date.now()
      };

      await saveSong(songData);
      addToast(`"${songData.title}" saved to local vault!`, 'success');
      
      // Reset form states
      setSelectedFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
      setCover('');
      
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      addToast('Error saving song to database!', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      
      {/* Step 1: Upload Drag Area */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragOver 
              ? 'border-cyber-green bg-cyber-green/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
              : 'border-white/10 hover:border-cyber-purple/50 bg-white/5 hover:bg-white/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="audio/*"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple mb-4 animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">Drag and drop your audio here</h3>
          <p className="text-sm text-slate-400">or click to browse local files (MP3, WAV, M4A, etc.)</p>
          <div className="mt-6 flex gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <span>IndexedDB Secure Storage</span>
            <span>•</span>
            <span>100% Offline Mode</span>
          </div>
        </div>
      ) : (
        /* Step 2: Edit Metadata Form */
        <form onSubmit={handleSave} className="glass-panel border border-white/5 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
          
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyber-green" />
            <span>Track details</span>
          </h3>

          <div className="flex gap-6 mb-6">
            
            {/* Album Cover Art Area */}
            <div 
              onClick={() => coverInputRef.current.click()}
              className="w-32 h-32 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden relative group text-slate-400 hover:text-white"
            >
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                accept="image/*"
                className="hidden"
              />
              {cover ? (
                <>
                  <img src={cover} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold tracking-wider transition-opacity duration-200">
                    Change Art
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 mb-1.5 text-cyber-purple" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">Cover Art</span>
                </>
              )}
            </div>

            {/* Inputs Details */}
            <div className="flex-grow flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Song Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyber-green/50 outline-none text-sm text-white transition-colors"
                  placeholder="Midnight Breeze"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Artist Name</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyber-green/50 outline-none text-sm text-white transition-colors"
                  placeholder="Lofi Echoes"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-6">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Album Title</label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-cyber-green/50 outline-none text-sm text-white transition-colors"
              placeholder="Urban Nocturnes"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-green hover:opacity-90 text-cyber-dark font-extrabold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {uploading ? 'Storing...' : 'Save to Vault'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default UploadZone;
