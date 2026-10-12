import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, GitBranch, RotateCcw, ArrowRight } from 'lucide-react';
import { ClassifiedMove } from '../types/chess';

interface NotationPaneProps {
  sanHistory: string[];
  currentMoveIndex: number;
  onSelectMoveIndex: (idx: number) => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  classifiedMoves?: ClassifiedMove[];
  isBranching?: boolean;
  branchName?: string;
  onExitBranch?: () => void;
  onPromoteBranch?: () => void;
}

export const NotationPane: React.FC<NotationPaneProps> = ({
  sanHistory,
  currentMoveIndex,
  onSelectMoveIndex,
  onStepBackward,
  onStepForward,
  onJumpToStart,
  onJumpToEnd,
  classifiedMoves = [],
  isBranching = false,
  branchName = 'Speculative Branch',
  onExitBranch,
  onPromoteBranch,
}) => {
  // Group moves into turns: [ { number: 1, white: 'e4', black: 'e5', whiteIdx: 0, blackIdx: 1 } ]
  const turns: {
    number: number;
    white?: string;
    black?: string;
    whiteIdx: number;
    blackIdx?: number;
  }[] = [];

  for (let i = 0; i < sanHistory.length; i += 2) {
    const turnNumber = Math.floor(i / 2) + 1;
    turns.push({
      number: turnNumber,
      white: sanHistory[i],
      black: sanHistory[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < sanHistory.length ? i + 1 : undefined,
    });
  }

  const getClassificationBadge = (idx: number) => {
    const move = classifiedMoves[idx];
    if (!move) return null;

    switch (move.classification) {
      case 'brilliant':
        return <span className="text-[10px] text-cyan-400 font-extrabold ml-0.5">!!</span>;
      case 'great':
        return <span className="text-[10px] text-teal-400 font-bold ml-0.5">!</span>;
      case 'best':
        return <span className="text-[10px] text-emerald-400 ml-0.5">★</span>;
      case 'inaccuracy':
        return <span className="text-[10px] text-amber-400 font-bold ml-0.5">?!</span>;
      case 'mistake':
        return <span className="text-[10px] text-orange-400 font-bold ml-0.5">?</span>;
      case 'blunder':
        return <span className="text-[10px] text-red-500 font-extrabold ml-0.5">??</span>;
      case 'book':
        return <span className="text-[9px] text-purple-400 ml-0.5">📖</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Branching Banner if active */}
      {isBranching && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-cyan-950/80 border-b border-cyan-800/60 text-cyan-300 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[150px]">{branchName}</span>
          </div>
          <div className="flex items-center gap-1">
            {onPromoteBranch && (
              <button
                onClick={onPromoteBranch}
                className="px-2 py-0.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-[10px] font-semibold transition"
                title="Promote this branch to mainline"
              >
                Promote
              </button>
            )}
            {onExitBranch && (
              <button
                onClick={onExitBranch}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
              >
                Revert
              </button>
            )}
          </div>
        </div>
      )}

      {/* Move History Table Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5 min-h-[90px] max-h-[140px] scrollbar-thin scrollbar-thumb-slate-700">
        {turns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
            Moves will appear here
          </div>
        ) : (
          turns.map((turn) => {
            const isWhiteActive = currentMoveIndex === turn.whiteIdx;
            const isBlackActive = currentMoveIndex === turn.blackIdx;

            return (
              <div
                key={turn.number}
                className="grid grid-cols-[32px_1fr_1fr] items-center py-0.5 px-1 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {/* Turn Number */}
                <span className="text-slate-500 font-medium">{turn.number}.</span>

                {/* White Move */}
                <button
                  onClick={() => onSelectMoveIndex(turn.whiteIdx)}
                  className={`text-left px-1.5 py-0.5 rounded transition flex items-center justify-between ${
                    isWhiteActive
                      ? 'bg-emerald-500/25 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span>{turn.white}</span>
                  {getClassificationBadge(turn.whiteIdx)}
                </button>

                {/* Black Move */}
                {turn.black ? (
                  <button
                    onClick={() => turn.blackIdx !== undefined && onSelectMoveIndex(turn.blackIdx)}
                    className={`text-left px-1.5 py-0.5 rounded transition flex items-center justify-between ${
                      isBlackActive
                        ? 'bg-emerald-500/25 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{turn.black}</span>
                    {turn.blackIdx !== undefined && getClassificationBadge(turn.blackIdx)}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* VCR Step & Replay Navigation Controls */}
      <div className="flex items-center justify-around py-1.5 bg-slate-950/60 border-t border-slate-800/80 px-2 text-slate-400">
        <button
          onClick={onJumpToStart}
          disabled={currentMoveIndex < 0}
          className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Jump to Start"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onStepBackward}
          disabled={currentMoveIndex < 0}
          className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 font-semibold px-2">
          {currentMoveIndex + 1} / {sanHistory.length}
        </span>
        <button
          onClick={onStepForward}
          disabled={currentMoveIndex >= sanHistory.length - 1}
          className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onJumpToEnd}
          disabled={currentMoveIndex >= sanHistory.length - 1}
          className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Jump to Current Position"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
