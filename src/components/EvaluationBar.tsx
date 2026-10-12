import React from 'react';
import { EngineEvaluation } from '../types/chess';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface EvaluationBarProps {
  evaluation: EngineEvaluation;
  orientation: 'w' | 'b';
  compact?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  orientation,
  compact = false,
}) => {
  const { scoreCp, scoreMate, depth, isTablebase, tablebaseResult, tablebaseDtm } = evaluation;

  // Convert scoreCp or mate into a percentage (0% to 100% White advantage)
  let whitePercent = 50;
  let displayScore = '0.0';

  if (tablebaseResult) {
    if (tablebaseResult === 'win') {
      whitePercent = orientation === 'w' ? 100 : 0;
      displayScore = tablebaseDtm ? `M${tablebaseDtm}` : 'WIN';
    } else if (tablebaseResult === 'loss') {
      whitePercent = orientation === 'w' ? 0 : 100;
      displayScore = tablebaseDtm ? `-M${tablebaseDtm}` : 'LOSS';
    } else {
      whitePercent = 50;
      displayScore = '0.0';
    }
  } else if (scoreMate !== null) {
    if (scoreMate > 0) {
      whitePercent = 100;
      displayScore = `M${scoreMate}`;
    } else {
      whitePercent = 0;
      displayScore = `-M${Math.abs(scoreMate)}`;
    }
  } else if (scoreCp !== null) {
    // Sigmoid curve mapping centipawns to 0..100%
    // 0 cp -> 50%, +300 cp -> ~85%, +600 cp -> ~97%
    const winChance = 1 / (1 + Math.pow(10, -scoreCp / 400));
    whitePercent = Math.max(3, Math.min(97, Math.round(winChance * 100)));

    const cpValue = scoreCp / 100;
    displayScore = (cpValue > 0 ? `+${cpValue.toFixed(1)}` : cpValue.toFixed(1));
    if (scoreCp === 0) displayScore = '0.0';
  }

  // Bar fill height depending on board orientation
  const fillHeight = orientation === 'w' ? whitePercent : 100 - whitePercent;

  return (
    <div
      className={`relative flex flex-col justify-between items-center rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900 shadow-inner select-none ${
        compact ? 'w-5 h-full' : 'w-7 h-full'
      }`}
      title={`Engine Depth ${depth} | Eval: ${displayScore}`}
    >
      {/* Top half (opponent or Black perspective) */}
      <div className="absolute inset-0 bg-slate-900 z-0" />

      {/* Animated White Advantage Fill */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-100 via-slate-200 to-emerald-100 transition-all duration-300 ease-out z-10"
        style={{ height: `${fillHeight}%` }}
      />

      {/* Text Score Overlay */}
      <div className="relative z-20 w-full flex flex-col items-center justify-between py-1 h-full text-[10px] font-mono font-bold">
        {/* Top score (visible if advantage favors top) */}
        <span
          className={`px-0.5 rounded transition-colors ${
            fillHeight < 50
              ? 'text-slate-100 font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              : 'text-slate-900 drop-shadow-none'
          }`}
        >
          {fillHeight <= 50 ? displayScore : ''}
        </span>

        {/* Tablebase / Depth Indicator */}
        {isTablebase ? (
          <span
            className="flex items-center justify-center p-0.5 text-amber-500 bg-amber-500/20 rounded-full"
            title="Endgame Tablebase Solved"
          >
            <ShieldAlert className="w-2.5 h-2.5" />
          </span>
        ) : (
          <span className="text-[8px] text-slate-500 font-semibold opacity-75">
            d{depth}
          </span>
        )}

        {/* Bottom score (visible if advantage favors bottom) */}
        <span
          className={`px-0.5 rounded transition-colors ${
            fillHeight > 50
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-300 font-bold'
          }`}
        >
          {fillHeight > 50 ? displayScore : ''}
        </span>
      </div>
    </div>
  );
};
