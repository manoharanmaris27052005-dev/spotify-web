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
    <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-black border-t border-[#282828] flex items-center justify-between px-4 md:px-6 z-50">
      
      {/* 1. Left side: Song details */}
      <div className="flex items-center gap-4 w-1/4">
        {currentSong ? (
          <>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 active-breathing-cover flex-shrink-0">
              {currentSong.cover ? (
                <img 
                  src={currentSong.cover} 
                  alt="Cover" 
                  className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'animate-spin-slow' : ''}`} 
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-tr from-cyber-purple/20 to-cyber-green/10 flex items-center justify-center text-cyber-purple ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <Disc className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-100 truncate hover:underline cursor-pointer">
                {currentSong.title}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {currentSong.artist}
              </span>
            </div>

            {/* Favorite heart */}
            <button 
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg hover:bg-white/5 transition-all active:scale-95 duration-100 flex-shrink-0 ${isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
            >
              <Heart className="w-5 h-5 fill-current" style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-slate-500">
            <Disc className="w-8 h-8 animate-spin-slow opacity-30" />
            <div className="flex flex-col text-xs font-semibold uppercase tracking-wider">
              <span>VibeVault Offline</span>
              <span className="text-[10px] text-slate-600">Select or drop a song</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Middle side: Main controls and visualizer */}
      <div className="flex flex-col items-center gap-2 flex-grow max-w-2xl px-10">
        
        {/* Real-time Canvas visualizer container (hidden to match Spotify) */}
        <div className="w-full flex justify-center opacity-0 hover:opacity-10 transition-opacity absolute pointer-events-none">
          <canvas ref={canvasRef} className="w-full pointer-events-none h-4" />
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleShuffle}
            className={`p-2 rounded-lg hover:scale-105 active:scale-95 duration-100 transition-colors relative ${isShuffle ? 'text-cyber-green' : 'text-slate-400 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-green shadow-[0_0_5px_#10B981]" />}
          </button>

          <button 
            onClick={onPrev}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:scale-110 active:scale-90 transition-all duration-100"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button 
            onClick={onTogglePlay}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 duration-100 transition-transform"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />}
          </button>

          <button 
            onClick={onNext}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:scale-110 active:scale-90 transition-all duration-100"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button 
            onClick={onToggleRepeat}
            className={`p-2 rounded-lg hover:scale-105 active:scale-95 duration-100 transition-colors relative ${isRepeat ? 'text-cyber-purple animate-pulse' : 'text-slate-400 hover:text-white'}`}
            title="Repeat Context"
          >
            <Repeat className="w-4 h-4" />
            {isRepeat && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-purple shadow-[0_0_5px_#8B5CF6]" />}
          </button>
        </div>

        {/* Timeline Progress seek bar */}
        <div className="w-full flex items-center gap-3 mt-1">
          <span className="text-[10px] font-bold text-slate-500 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => {
              if (duration > 0) {
                const targetTime = (parseFloat(e.target.value) / 100) * duration;
                onSeek(targetTime);
              }
            }}
            className="flex-grow h-1.5 transition-all duration-200 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #10B981 ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
          <span className="text-[10px] font-bold text-slate-500 w-10 text-left">{formatTime(duration)}</span>
        </div>

      </div>

      {/* 3. Right side: Volume and sleep timer actions */}
      <div className="flex items-center gap-4 w-1/4 justify-end">
        
        {/* Sleep Timer Display trigger */}
        <button 
          onClick={onOpenTimer}
          className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 ${
            activeTimer !== null 
              ? 'border-cyber-purple text-cyber-purple bg-cyber-purple/5 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
              : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
          {activeTimer !== null && (
            <span className="text-xs font-extrabold tracking-wider">{activeTimer}m</span>
          )}
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleMute}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:scale-105 transition-transform"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value) / 100)}
            className="w-20 h-1 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${isMuted ? 0 : volume * 100}%, rgba(255, 255, 255, 0.1) ${isMuted ? 0 : volume * 100}%, rgba(255, 255, 255, 0.1) 100%)`
            }}
          />
        </div>

      </div>

    </footer>
  );
};

export default MusicPlayer;
