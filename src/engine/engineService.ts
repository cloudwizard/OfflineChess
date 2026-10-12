import { EngineEvaluation, EnginePersonality, EngineSettings } from '../types/chess';
import { evaluateTablebase } from './tablebase';

type EvalCallback = (evaluation: EngineEvaluation) => void;
type BestMoveCallback = (bestMove: string, ponder?: string) => void;

class EngineService {
  private worker: Worker | null = null;
  private isReady = false;
  private isCalculating = false;
  private currentEval: EngineEvaluation = {
    depth: 0,
    scoreCp: 0,
    scoreMate: null,
    bestMove: null,
    bestLine: [],
    nodes: 0,
    nps: 0,
    timeMs: 0,
  };
  private evalListeners: Set<EvalCallback> = new Set();
  private bestMoveListeners: Set<BestMoveCallback> = new Set();
  private currentPositionFen: string = '';
  private currentPersonality: EnginePersonality | null = null;
  private settings: EngineSettings = {
    hashMb: 16,
    threads: 1,
    autoThrottle: true,
    showEvalBar: true,
    showGhostArrow: true,
    hapticFeedback: true,
    soundEffects: true,
    boardTheme: 'emerald',
  };
  private engineTier: 'nnue' | 'wasm' | 'fallback' = 'wasm';

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      // Create dedicated Web Worker running Stockfish
      // Use standard worker path with fallback
      const workerUrl = '/engine/stockfish.wasm.js';
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (event: MessageEvent) => {
        const line = typeof event.data === 'string' ? event.data : '';
        this.handleUciOutput(line);
      };

      this.worker.onerror = (err) => {
        console.warn('Primary Stockfish worker error, attempting fallback:', err);
        this.fallbackToJsEngine();
      };

      // Send initial UCI protocol handshake
      this.sendUci('uci');
      this.sendUci('isready');
      this.configureEngineOptions();
    } catch (err) {
      console.warn('Worker initialization failed:', err);
      this.fallbackToJsEngine();
    }
  }

  private fallbackToJsEngine() {
    try {
      if (this.worker) {
        this.worker.terminate();
      }
      this.engineTier = 'fallback';
      this.worker = new Worker('/engine/stockfish.js');
      this.worker.onmessage = (event: MessageEvent) => {
        this.handleUciOutput(typeof event.data === 'string' ? event.data : '');
      };
      this.sendUci('uci');
      this.sendUci('isready');
      this.configureEngineOptions();
    } catch {
      console.error('All Stockfish worker fallbacks failed');
    }
  }

  public getEngineTier() {
    return this.engineTier;
  }

  public updateSettings(newSettings: Partial<EngineSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.configureEngineOptions();
  }

  public setPersonality(personality: EnginePersonality) {
    this.currentPersonality = personality;
    this.configureEngineOptions();
  }

  private configureEngineOptions() {
    if (!this.worker) return;

    // Mobile Memory optimization (Hash table)
    const hash = this.currentPersonality?.hashMb || this.settings.hashMb || 16;
    this.sendUci(`setoption name Hash value ${hash}`);

    // Threads (keep at 1 for battery and thermal optimization on mobile)
    this.sendUci(`setoption name Threads value ${this.settings.threads || 1}`);

    // ELO and Strength Limiting
    if (this.currentPersonality && this.currentPersonality.limitStrength) {
      this.sendUci('setoption name UCI_LimitStrength value true');
      this.sendUci(`setoption name UCI_Elo value ${this.currentPersonality.elo}`);
    } else {
      this.sendUci('setoption name UCI_LimitStrength value false');
    }

    // Playstyle Aggression / Contempt
    if (this.currentPersonality) {
      const contempt = Math.round((this.currentPersonality.aggression - 50) * 0.8);
      this.sendUci(`setoption name Contempt value ${contempt}`);
    }

    this.sendUci('isready');
  }

  public sendUci(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  private handleUciOutput(line: string) {
    if (!line) return;

    if (line === 'uciok' || line === 'readyok') {
      this.isReady = true;
      return;
    }

    // Parse info line: "info depth 12 score cp 35 nodes 24000 nps 150000 time 160 pv e2e4 c7c5 ..."
    if (line.startsWith('info ') && line.includes('score ')) {
      this.parseInfoLine(line);
      return;
    }

    // Parse bestmove line: "bestmove e2e4 ponder e7e5"
    if (line.startsWith('bestmove ')) {
      this.isCalculating = false;
      const parts = line.split(' ');
      const bestMove = parts[1];
      const ponder = parts[2] === 'ponder' ? parts[3] : undefined;

      if (bestMove && bestMove !== '(none)') {
        this.currentEval.bestMove = bestMove;
        this.notifyEval();
        for (const listener of this.bestMoveListeners) {
          listener(bestMove, ponder);
        }
      }
    }
  }

  private parseInfoLine(line: string) {
    // Check if tablebase applies first
    const tb = evaluateTablebase(this.currentPositionFen);

    const depthMatch = line.match(/\bdepth (\d+)\b/);
    const seldepthMatch = line.match(/\bseldepth (\d+)\b/);
    const cpMatch = line.match(/\bscore cp (-?\d+)\b/);
    const mateMatch = line.match(/\bscore mate (-?\d+)\b/);
    const nodesMatch = line.match(/\bnodes (\d+)\b/);
    const npsMatch = line.match(/\bnps (\d+)\b/);
    const timeMatch = line.match(/\btime (\d+)\b/);
    const pvIndex = line.indexOf(' pv ');

    let bestLine: string[] = [];
    if (pvIndex !== -1) {
      bestLine = line.substring(pvIndex + 4).trim().split(/\s+/);
    }

    const depth = depthMatch ? parseInt(depthMatch[1], 10) : this.currentEval.depth;
    const seldepth = seldepthMatch ? parseInt(seldepthMatch[1], 10) : undefined;
    const nodes = nodesMatch ? parseInt(nodesMatch[1], 10) : this.currentEval.nodes;
    const nps = npsMatch ? parseInt(npsMatch[1], 10) : this.currentEval.nps;
    const timeMs = timeMatch ? parseInt(timeMatch[1], 10) : this.currentEval.timeMs;

    let scoreCp: number | null = null;
    let scoreMate: number | null = null;

    if (mateMatch) {
      scoreMate = parseInt(mateMatch[1], 10);
      scoreCp = scoreMate > 0 ? 10000 - scoreMate * 10 : -10000 - scoreMate * 10;
    } else if (cpMatch) {
      scoreCp = parseInt(cpMatch[1], 10);
    }

    // Invert score if Black to move so eval is always normalized to White's vantage
    const isBlackToMove = this.currentPositionFen.includes(' b ');
    const normalizedCp = scoreCp !== null ? (isBlackToMove ? -scoreCp : scoreCp) : 0;
    const normalizedMate = scoreMate !== null ? (isBlackToMove ? -scoreMate : scoreMate) : null;

    this.currentEval = {
      depth,
      seldepth,
      scoreCp: normalizedCp,
      scoreMate: normalizedMate,
      bestMove: bestLine[0] || this.currentEval.bestMove,
      bestLine,
      nodes,
      nps,
      timeMs,
      isTablebase: !!tb,
      tablebaseResult: tb?.result,
      tablebaseDtm: tb?.dtm,
    };

    this.notifyEval();
  }

  private notifyEval() {
    for (const listener of this.evalListeners) {
      listener(this.currentEval);
    }
  }

  public subscribeEval(cb: EvalCallback): () => void {
    this.evalListeners.add(cb);
    cb(this.currentEval);
    return () => this.evalListeners.delete(cb);
  }

  public subscribeBestMove(cb: BestMoveCallback): () => void {
    this.bestMoveListeners.add(cb);
    return () => this.bestMoveListeners.delete(cb);
  }

  public evaluatePosition(fen: string, maxDepth?: number, maxTimeMs?: number) {
    this.currentPositionFen = fen;
    this.stop();

    // Check tablebase instant heuristic
    const tb = evaluateTablebase(fen);
    if (tb) {
      const isBlackToMove = fen.includes(' b ');
      let cp = 0;
      let mate: number | null = null;
      if (tb.result === 'win') {
        mate = tb.dtm || 5;
        cp = 9900;
      } else if (tb.result === 'loss') {
        mate = -(tb.dtm || 5);
        cp = -9900;
      }
      this.currentEval = {
        depth: 35,
        scoreCp: isBlackToMove ? -cp : cp,
        scoreMate: isBlackToMove && mate ? -mate : mate,
        bestMove: null,
        bestLine: [],
        nodes: 1,
        nps: 1,
        timeMs: 1,
        isTablebase: true,
        tablebaseResult: tb.result,
        tablebaseDtm: tb.dtm,
      };
      this.notifyEval();
    }

    this.sendUci('stop');
    this.sendUci(`position fen ${fen}`);

    // Determine depth limit based on device throttle settings & personality
    let depth = maxDepth || this.currentPersonality?.depth || 14;
    if (this.settings.autoThrottle && depth > 12) {
      // Battery / thermal throttle: cap to 12 on continuous mobile analysis
      depth = 12;
    }

    const timeCommand = maxTimeMs ? ` movetime ${maxTimeMs}` : '';
    this.isCalculating = true;
    this.sendUci(`go depth ${depth}${timeCommand}`);
  }

  public findBestMove(fen: string, depth?: number, timeMs?: number) {
    this.currentPositionFen = fen;
    this.sendUci('stop');
    this.sendUci(`position fen ${fen}`);

    const targetDepth = depth || this.currentPersonality?.depth || 12;
    const targetTime = timeMs || (this.currentPersonality?.playstyle === 'aggressive' ? 1200 : 800);

    this.isCalculating = true;
    this.sendUci(`go depth ${targetDepth} movetime ${targetTime}`);
  }

  public stop() {
    if (this.isCalculating) {
      this.sendUci('stop');
      this.isCalculating = false;
    }
  }

  public reset() {
    this.stop();
    this.sendUci('ucinewgame');
    this.sendUci('isready');
  }
}

export const engineService = new EngineService();
