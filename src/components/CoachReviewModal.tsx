import React, { useState } from 'react';
import { X, Award, AlertTriangle, Sparkles, HelpCircle, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { GameReviewReport, ClassifiedMove } from '../types/chess';

interface CoachReviewModalProps {
  report: GameReviewReport;
  whitePlayerName: string;
  blackPlayerName: string;
  onClose: () => void;
  onJumpToMove: (moveIndex: number) => void;
}

export const CoachReviewModal: React.FC<CoachReviewModalProps> = ({
  report,
  whitePlayerName,
  blackPlayerName,
  onClose,
  onJumpToMove,
}) => {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(report.keyMomentIndex ?? 0);
  const activeMove: ClassifiedMove | undefined = report.classifiedMoves[selectedMoveIndex];

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'brilliant':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'great':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'best':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'excellent':
        return 'bg-emerald-600/10 text-emerald-300 border-emerald-600/30';
      case 'book':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'inaccuracy':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'mistake':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'blunder':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Offline Coach Game Review
              </h3>
              <p className="text-xs text-slate-400">
                Stockfish Move Classification & Accuracy Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Accuracy Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* White Player Card */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col items-center">
              <span className="text-xs text-slate-400 truncate max-w-[120px] font-medium">
                {whitePlayerName} (White)
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {report.whiteAccuracy}%
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                CAPS Accuracy
              </span>
            </div>

            {/* Black Player Card */}
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col items-center">
              <span className="text-xs text-slate-400 truncate max-w-[120px] font-medium">
                {blackPlayerName} (Black)
              </span>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">
                {report.blackAccuracy}%
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                CAPS Accuracy
              </span>
            </div>
          </div>

          {/* Move Stats Distribution */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Move Classifications</span>
            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="font-bold">!!</span>
                <span>Brilliant: {report.whiteStats.brilliant + report.blackStats.brilliant}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>★</span>
                <span>Best: {report.whiteStats.best + report.blackStats.best}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="font-bold">?!</span>
                <span>Inaccuracies: {report.whiteStats.inaccuracy + report.blackStats.inaccuracy}</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <span className="font-bold">??</span>
                <span>Blunders: {report.whiteStats.blunder + report.blackStats.blunder}</span>
              </div>
            </div>
          </div>

          {/* Interactive "Why Was This a Blunder?" Coach Breakdown */}
          {activeMove && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${getBadgeStyle(activeMove.classification)}`}>
                    {activeMove.classification}
                  </span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {activeMove.moveNumber}.{activeMove.color === 'b' ? '..' : ''} {activeMove.san}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onJumpToMove(selectedMoveIndex);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <span>View on Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coach Explanation */}
              <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{activeMove.explanation}</p>
              </div>

              {/* Refutation & Best Engine Alternative */}
              {activeMove.bestEngineSan && activeMove.classification !== 'best' && (
                <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Best engine move: <strong className="font-mono text-white">{activeMove.bestEngineSan}</strong></span>
                  </div>
                  {activeMove.evalLoss > 0 && (
                    <span className="text-[11px] text-amber-400 font-mono">
                      -{(activeMove.evalLoss / 100).toFixed(1)} eval
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* List of critical mistakes / moves */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400">All Moves Timeline</span>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {report.classifiedMoves.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMoveIndex(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    selectedMoveIndex === idx
                      ? 'bg-slate-700/80 border border-slate-600 text-white'
                      : 'bg-slate-800/40 hover:bg-slate-800 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-10 text-left">
                      {m.moveNumber}.{m.color === 'b' ? '..' : ''}
                    </span>
                    <span className="font-mono font-bold">{m.san}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getBadgeStyle(m.classification)}`}>
                    {m.classification}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};
