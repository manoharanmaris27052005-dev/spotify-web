import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Moon, Trash2, Heart, Disc, Sparkles
} from 'lucide-react';

const MusicPlayer = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  progress,
  duration,
  currentTime,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  activeTimer,
  onOpenTimer,
  isFavorite,
  onToggleFavorite,
  analyserNode // ExposeAnalyserNode from parent context
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Dynamic seek progress percentage calculate
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Canvas Real-time Frequency Audio Visualizer Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 40;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    // Initialize mock visualizer sequence if actual audio analyzer is absent
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (analyserNode) {
        // Read actual Web Audio frequency data
        bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Fallback simulated frequency coefficients
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = isPlaying 
            ? Math.abs(Math.sin(Date.now() * 0.003 + i * 0.1)) * 120 * (0.4 + Math.random() * 0.6) 
            : 5;
        }
      }

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 1.2;

        // Gradient color calculations (neon purple to emerald green)
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)'); // Violet Purple
        gradient.addColorStop(1, '#10B981');                 // Neon Green

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Clean up
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, analyserNode]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#181818] border-t border-[#282828] flex items-center justify-between px-4 z-50 select-none">

      {/* LEFT: Song Info */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        {currentSong ? (
          <>
            <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 shadow-lg">
              {currentSong.cover ? (
                <img src={currentSong.cover} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <Disc className="w-6 h-6 text-[#6a6a6a]" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate hover:underline cursor-pointer">{currentSong.title}</span>
              <span className="text-xs text-[#b3b3b3] truncate hover:text-white hover:underline cursor-pointer">{currentSong.artist}</span>
            </div>
            <button
              onClick={onToggleFavorite}
              className={`p-2 ml-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ${isFavorite ? 'text-[#1DB954]' : 'text-[#6a6a6a] hover:text-white'}`}
            >
              <Heart className="w-4 h-4" style={{ fill: isFavorite ? 'currentColor' : 'none', stroke: 'currentColor' }} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#6a6a6a]">
            <div className="w-14 h-14 rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#b3b3b3]">No song selected</p>
              <p className="text-xs text-[#6a6a6a]">Search and play a song</p>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: Controls */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[600px] px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
          </button>

          <button onClick={onPrev} className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-all" title="Previous">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause className="w-4 h-4 fill-current" />
              : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button onClick={onNext} className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-all" title="Next">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${isRepeat ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
            {isRepeat && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-[#6a6a6a] w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="flex-1 group relative h-1 flex items-center">
            <input
              type="range"
              min="0" max="100"
              value={progressPercent}
              onChange={(e) => { if (duration > 0) onSeek((parseFloat(e.target.value) / 100) * duration); }}
              className="w-full h-1 rounded-full cursor-pointer"
              style={{ background: `linear-gradient(to right, #1DB954 ${progressPercent}%, #4d4d4d ${progressPercent}%)` }}
            />
          </div>
          <span className="text-[11px] text-[#6a6a6a] w-9 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Volume */}
      <div className="flex items-center gap-2 w-[30%] justify-end">
        <button
          onClick={onOpenTimer}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${activeTimer !== null ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleMute}
          className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0" max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value) / 100)}
          className="w-24 h-1 cursor-pointer"
          style={{ background: `linear-gradient(to right, #ffffff ${isMuted ? 0 : volume * 100}%, #4d4d4d ${isMuted ? 0 : volume * 100}%)` }}
        />
      </div>

    </footer>
  );
};

export default MusicPlayer;
