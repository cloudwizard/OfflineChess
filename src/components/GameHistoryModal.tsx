import React, { useState, useEffect } from 'react';
import { X, History, Trash2, Award, Copy, Check, Play } from 'lucide-react';
import { SavedGame } from '../types/chess';
import { getAllSavedGames, deleteSavedGame } from '../db/gameStorage';

interface GameHistoryModalProps {
  onClose: () => void;
  onLoadGame: (game: SavedGame) => void;
  onOpenReview: (game: SavedGame) => void;
}

export const GameHistoryModal: React.FC<GameHistoryModalProps> = ({
  onClose,
  onLoadGame,
  onOpenReview,
}) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const list = await getAllSavedGames();
    setGames(list);
  };

  const handleDelete = async (id: string) => {
    await deleteSavedGame(id);
    await loadGames();
  };

  const copyPgn = (game: SavedGame) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(game.pgn);
      setCopiedId(game.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Saved Game History</h3>
              <p className="text-xs text-slate-400">Offline Games Stored in IndexedDB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {games.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              No saved games yet. Finish a match against Stockfish or in Pass-and-Play to review!
            </div>
          ) : (
            games.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-200">
                      {g.result}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {g.whiteName} vs {g.blackName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{g.dateStr}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    {g.review && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <Award className="w-3.5 h-3.5" />
                        Acc: {g.review.whiteAccuracy}% / {g.review.blackAccuracy}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {g.review && (
                      <button
                        onClick={() => {
                          onOpenReview(g);
                          onClose();
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-medium transition"
                      >
                        Coach Review
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLoadGame(g);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                      title="Load into board"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyPgn(g)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                      title="Copy PGN"
                    >
                      {copiedId === g.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      title="Delete Game"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
