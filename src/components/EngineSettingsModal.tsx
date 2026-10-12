import React from 'react';
import { X, Cpu, BatteryCharging, Vibrate, Volume2, Palette, ShieldCheck } from 'lucide-react';
import { EngineSettings } from '../types/chess';
import { engineService } from '../engine/engineService';

interface EngineSettingsModalProps {
  settings: EngineSettings;
  onUpdateSettings: (newSettings: Partial<EngineSettings>) => void;
  onClose: () => void;
}

export const EngineSettingsModal: React.FC<EngineSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const engineTier = engineService.getEngineTier();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">Engine & App Settings</h3>
              <p className="text-xs text-slate-400">Mobile Stockfish 16+ Wasm & UI Config</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Tier Badge */}
        <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200">Wasm Engine Active</span>
              <p className="text-[10px] text-slate-400">
                {engineTier === 'wasm'
                  ? 'Stockfish 16 WebAssembly (Single/Multi-Thread Worker)'
                  : 'Single-Threaded asm.js Fallback Engine'}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
            100% Offline
          </span>
        </div>

        {/* Setting Items */}
        <div className="space-y-4 text-xs">
          {/* Dynamic Hash Memory Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Hash Table Size (RAM)</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.hashMb} MB</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[16, 32, 64, 128].map((mb) => (
                <button
                  key={mb}
                  onClick={() => onUpdateSettings({ hashMb: mb })}
                  className={`py-1.5 rounded-lg font-mono text-xs border transition ${
                    settings.hashMb === mb
                      ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-slate-700/60'
                  }`}
                >
                  {mb} MB
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              16MB is optimal for mobile battery; 64MB+ provides deeper transposition caching on tablets.
            </p>
          </div>

          {/* Battery Saver / Engine Throttling Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-200 block">Thermal & Battery Saver</span>
                <span className="text-[10px] text-slate-400">
                  Caps search depth on continuous analysis to avoid smartphone heating
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoThrottle}
              onChange={(e) => onUpdateSettings({ autoThrottle: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Board Theme Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Board Color Theme</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'emerald', name: 'Emerald', color: 'bg-[#769656]' },
                { id: 'ocean', name: 'Ocean', color: 'bg-[#507299]' },
                { id: 'obsidian', name: 'Obsidian', color: 'bg-[#1e293b]' },
                { id: 'wood', name: 'Wood', color: 'bg-[#996633]' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ boardTheme: th.id as any })}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 border transition ${
                    settings.boardTheme === th.id
                      ? 'border-emerald-400 bg-slate-800 font-bold text-white'
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${th.color} border border-white/20`} />
                  <span className="text-[10px]">{th.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Style Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm">♞</span>
                <span>Piece Aesthetics</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono capitalize">
                {settings.pieceStyle || 'neo'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'neo', name: 'Neo Master', desc: 'Porcelain & Obsidian with 3D Depth' },
                { id: 'classic', name: 'Classic Staunton', desc: 'Clean Tournament Vector' },
                { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon Emerald & Cyan Glow' },
              ].map((styleOption) => (
                <button
                  key={styleOption.id}
                  onClick={() => onUpdateSettings({ pieceStyle: styleOption.id as any })}
                  className={`p-2 rounded-xl flex flex-col items-center text-center border transition ${
                    (settings.pieceStyle || 'neo') === styleOption.id
                      ? 'border-emerald-400 bg-slate-800 text-white font-bold ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs">{styleOption.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">{styleOption.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Haptics & Sound */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-200">Haptics</span>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={(e) => onUpdateSettings({ hapticFeedback: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-slate-200">Sounds</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
              />
            </div>
          </div>
          {/* Stockfish Open Source Attribution & GPLv3 Compliance */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <span>Stockfish Chess Engine (GPLv3)</span>
              <a
                href="/engine/LICENSE.txt"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                View License Text
              </a>
            </div>
            <p className="text-[10px] leading-relaxed">
              DeepPocket uses Stockfish, a free, open-source UCI chess engine licensed under the{' '}
              <strong className="text-slate-200">GNU General Public License v3 (GPLv3)</strong>. Copyright © 2008–2026 by Tord Romstad, Marco Costalba, Joona Kiiski, Gary Linscott, and the Stockfish developers. WebAssembly port by Niklas Fiekas and community contributors.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] text-emerald-400">
              <a
                href="https://github.com/official-stockfish/Stockfish"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Stockfish Source Code ↗
              </a>
              <span>•</span>
              <a
                href="https://github.com/niklasf/stockfish.js"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                stockfish.js / wasm Source ↗
              </a>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
