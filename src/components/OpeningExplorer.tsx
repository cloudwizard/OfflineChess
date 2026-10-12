import React from 'react';
import { BookOpen, Bookmark, ChevronRight, BarChart2 } from 'lucide-react';
import { identifyOpening, getBookMoves, BookMoveCandidate } from '../engine/openingBook';
import { bookmarkRepertoire } from '../db/gameStorage';

interface OpeningExplorerProps {
  sanHistory: string[];
  onPlayBookMove: (uci: string) => void;
  onBookmarkSuccess?: () => void;
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({
  sanHistory,
  onPlayBookMove,
  onBookmarkSuccess,
}) => {
  const currentOpening = identifyOpening(sanHistory);
  const candidates: BookMoveCandidate[] = getBookMoves(sanHistory);

  const handleBookmark = async () => {
    if (!currentOpening) return;
    await bookmarkRepertoire({
      eco: currentOpening.eco,
      name: currentOpening.name,
      moves: currentOpening.moves,
      notes: currentOpening.summary,
    });
    if (onBookmarkSuccess) onBookmarkSuccess();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-2.5">
      {/* Opening Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-300 font-mono text-[10px] font-bold">
                {currentOpening?.eco || 'ECO'}
              </span>
              <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[200px]">
                {currentOpening?.name || 'Starting Position'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {currentOpening?.summary || 'Standard chess starting position. Awaiting opening development.'}
            </p>
          </div>
        </div>

        {currentOpening && (
          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
            title="Bookmark opening to repertoire"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Candidate Book Moves List */}
      {candidates.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
            <span>Known Master Continuations</span>
            <span>Win / Draw %</span>
          </div>

          <div className="space-y-1">
            {candidates.slice(0, 4).map((cand) => (
              <button
                key={cand.san}
                onClick={() => onPlayBookMove(cand.uci)}
                className="w-full flex items-center justify-between p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition active:scale-98 text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-300 group-hover:text-purple-200">
                    {cand.san}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {cand.openingName}
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-2 rounded-full overflow-hidden flex bg-slate-700">
                    <div
                      className="bg-slate-200"
                      style={{ width: `${cand.whiteWinRate}%` }}
                      title={`White Win: ${cand.whiteWinRate}%`}
                    />
                    <div
                      className="bg-slate-500"
                      style={{ width: `${cand.drawRate}%` }}
                      title={`Draw: ${cand.drawRate}%`}
                    />
                    <div
                      className="bg-slate-900"
                      style={{ width: `${cand.blackWinRate}%` }}
                      title={`Black Win: ${cand.blackWinRate}%`}
                    />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 italic py-1 text-center">
          Novelty reached or out of book. Stockfish Wasm will evaluate dynamically.
        </div>
      )}
    </div>
  );
};
