import React from 'react';
import { WifiOff, Cpu } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="flex items-center gap-1">
        <Cpu className="w-3 h-3" />
        100% Client-Side Wasm
      </span>
      {!isOnline && (
        <span className="flex items-center gap-1 text-amber-400 border-l border-emerald-500/30 pl-1.5">
          <WifiOff className="w-2.5 h-2.5" />
          Offline
        </span>
      )}
    </div>
  );
};
