import React from 'react';
import { X, Award, Zap, Shield, Swords, Sparkles, UserCheck } from 'lucide-react';
import { EnginePersonality } from '../types/chess';
import { ENGINE_PERSONALITIES } from '../engine/personalities';

interface PersonalityModalProps {
  currentPersonality: EnginePersonality;
  onSelectPersonality: (personality: EnginePersonality) => void;
  onClose: () => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({
  currentPersonality,
  onSelectPersonality,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Engine Personalities</h3>
              <p className="text-xs text-slate-400">Calibrated Stockfish UCI ELO & Styles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {ENGINE_PERSONALITIES.map((p) => {
            const isSelected = currentPersonality.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPersonality(p);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700/50 shrink-0">
                  {p.avatar}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {p.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {p.elo} ELO
                    </span>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                    {p.title}
                  </span>

                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {p.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <span>Aggression: {p.aggression}%</span>
                    <span>•</span>
                    <span>Search Depth: {p.depth}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
