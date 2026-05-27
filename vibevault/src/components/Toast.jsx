import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-cyber-green" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-cyber-purple" />,
  };

  const borders = {
    success: 'border-cyber-green/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    error: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    info: 'border-cyber-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
  };

  return (
    <div className={`fixed bottom-28 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border glass-panel ${borders[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium text-slate-200">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
