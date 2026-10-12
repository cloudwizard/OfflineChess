import React from 'react';
import { RotateCw, Pause, Play, RotateCcw } from 'lucide-react';

interface PassAndPlayProps {
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: 'w' | 'b';
  autoRotateBoard: boolean;
  onToggleAutoRotate: () => void;
  isClockRunning: boolean;
  onToggleClock: () => void;
  onResetClock: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const PassAndPlayBar: React.FC<PassAndPlayProps> = ({
  whiteTimeMs,
  blackTimeMs,
  turn,
  autoRotateBoard,
  onToggleAutoRotate,
  isClockRunning,
  onToggleClock,
  onResetClock,
}) => {
  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs shadow-md">
      {/* Black Player Timer (Rotated 180° for opposite player) */}
      <div
        className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm transition ${
          turn === 'b' && isClockRunning
            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
            : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
        }`}
      >
        <span>{formatTime(blackTimeMs)}</span>
      </div>

      {/* Center Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleAutoRotate}
          className={`p-1.5 rounded-lg border transition ${
            autoRotateBoard
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title={autoRotateBoard ? 'Auto-rotate board enabled' : 'Auto-rotate board disabled'}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleClock}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          title={isClockRunning ? 'Pause Clock' : 'Resume Clock'}
        >
          {isClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={onResetClock}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          title="Reset Clock"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* White Player Timer */}
      <div
        className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm transition ${
          turn === 'w' && isClockRunning
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
        }`}
      >
        <span>{formatTime(whiteTimeMs)}</span>
      </div>
    </div>
  );
};
