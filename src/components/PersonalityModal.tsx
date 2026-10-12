import React, { useState } from 'react';
import { X, Sparkles, Sliders, ChevronDown, ChevronUp, Plus, Minus, Check } from 'lucide-react';
import { EnginePersonality } from '../types/chess';
import { ENGINE_PERSONALITIES } from '../engine/personalities';
import { getEloTierInfo, createCalibratedPersonality } from '../utils/eloTiers';

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
  const [customElo, setCustomElo] = useState<number>(currentPersonality.elo);
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<EnginePersonality['playstyle']>(
    currentPersonality.playstyle
  );
  const [selectedBasePersonality, setSelectedBasePersonality] = useState<EnginePersonality>(
    currentPersonality
  );

  const tierInfo = getEloTierInfo(customElo);

  const handleApplyFineGrained = () => {
    const calibrated = createCalibratedPersonality(
      {
        ...selectedBasePersonality,
        playstyle: selectedPlaystyle,
        aggression:
          selectedPlaystyle === 'aggressive'
            ? 85
            : selectedPlaystyle === 'defensive'
            ? 25
            : 50,
      },
      customElo
    );
    onSelectPersonality(calibrated);
    onClose();
  };

  const adjustElo = (delta: number) => {
    setCustomElo((prev) => Math.max(800, Math.min(3200, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Opponent Strength & ELO</h3>
              <p className="text-xs text-slate-400">Fine-Grained Stockfish 16+ UCI Calibration</p>
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Fine-Grained ELO Control Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Fine-Tune Exact ELO</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {tierInfo.badge}
                </span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  {customElo}
                </span>
              </div>
            </div>

            {/* Title & Description of Current ELO */}
            <div className="flex items-start gap-2.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-2xl">{tierInfo.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">{tierInfo.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Depth {tierInfo.estimatedDepth} • {tierInfo.timeMs}ms
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {tierInfo.description}
                </p>
              </div>
            </div>

            {/* Slider with step of 25 */}
            <div className="space-y-1">
              <input
                type="range"
                min="800"
                max="3200"
                step="25"
                value={customElo}
                onChange={(e) => setCustomElo(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>800 (Beginner)</span>
                <span>1500 (Club)</span>
                <span>2200 (Master)</span>
                <span>3200 (Max)</span>
              </div>
            </div>

            {/* Step Adjustment Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => adjustElo(-100)}
                disabled={customElo <= 800}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 transition"
              >
                -100
              </button>
              <button
                onClick={() => adjustElo(-25)}
                disabled={customElo <= 800}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 transition"
              >
                -25
              </button>
              <button
                onClick={() => adjustElo(25)}
                disabled={customElo >= 3200}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 transition"
              >
                +25
              </button>
              <button
                onClick={() => adjustElo(100)}
                disabled={customElo >= 3200}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 transition"
              >
                +100
              </button>
            </div>

            {/* Playstyle Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Playstyle Flavor</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'balanced', label: 'Balanced', desc: 'Standard positional' },
                  { id: 'aggressive', label: 'Tactical', desc: 'King attacks' },
                  { id: 'defensive', label: 'Prophylactic', desc: 'Solid fortress' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedPlaystyle(st.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition ${
                      selectedPlaystyle === st.id
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{st.label}</div>
                    <div className="text-[9px] text-slate-500">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyFineGrained}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Apply {customElo} ELO Rating</span>
            </button>
          </div>

          {/* Quick Personality Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">
              Or Choose a Grandmaster Preset:
            </span>
            <div className="space-y-1.5">
              {ENGINE_PERSONALITIES.map((p) => {
                const isSelected = currentPersonality.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedBasePersonality(p);
                      setCustomElo(p.elo);
                      setSelectedPlaystyle(p.playstyle);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60'
                    }`}
                  >
                    <span className="text-xl p-1.5 rounded-lg bg-slate-900 border border-slate-700/50 shrink-0">
                      {p.avatar}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 truncate">{p.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {p.elo} ELO
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        {p.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
