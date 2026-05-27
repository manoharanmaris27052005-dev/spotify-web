import React, { useState } from 'react';
import { Moon, Clock, X } from 'lucide-react';

const SleepTimerModal = ({ isOpen, activeTimer, onSetTimer, onClose }) => {
  const [customVal, setCustomVal] = useState('');

  if (!isOpen) return null;

  const presets = [
    { label: 'Off', value: null },
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const minutes = parseInt(customVal);
    if (minutes > 0) {
      onSetTimer(minutes);
      setCustomVal('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[360px] p-6 rounded-2xl glass-panel border border-cyber-purple/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-cyber-purple">
            <Moon className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Sleep Timer</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        {activeTimer !== null && (
          <div className="mb-6 p-4 rounded-xl bg-cyber-purple/5 border border-cyber-purple/10 flex items-center gap-3">
            <Clock className="w-4 h-4 text-cyber-purple animate-pulse" />
            <span className="text-sm text-slate-300">
              Timer active: <span className="font-semibold text-cyber-purple">{activeTimer} min remaining</span>
            </span>
          </div>
        )}

        {/* Presets Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onSetTimer(preset.value)}
              className="py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Timer Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            placeholder="Custom minutes..."
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyber-purple/50 outline-none text-sm text-white placeholder-slate-500 transition-colors"
            min="1"
            max="1440"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyber-purple hover:bg-cyber-purple/80 text-white font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 duration-100"
          >
            Set
          </button>
        </form>

      </div>
    </div>
  );
};

export default SleepTimerModal;
