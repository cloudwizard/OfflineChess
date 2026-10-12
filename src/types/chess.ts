export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface EngineEvaluation {
  depth: number;
  seldepth?: number;
  scoreCp: number | null; // Centipawns from White's perspective
  scoreMate: number | null; // Mate in N (+N = White wins in N, -N = Black wins in N)
  bestMove: string | null; // UCI format e.g. "e2e4"
  bestLine: string[]; // List of UCI moves e.g. ["e2e4", "c7c5", "g1f3"]
  nodes: number;
  nps: number;
  timeMs: number;
  isTablebase?: boolean;
  tablebaseResult?: 'win' | 'draw' | 'loss' | null;
  tablebaseDtm?: number | null;
}

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export interface ClassifiedMove {
  moveNumber: number;
  san: string;
  uci: string;
  color: PieceColor;
  fenBefore: string;
  fenAfter: string;
  classification: MoveClassification;
  evalBefore: number; // centipawns
  evalAfter: number;
  evalLoss: number;
  bestEngineMove: string;
  bestEngineSan: string;
  explanation: string;
  refutationLine?: string[];
}

export interface GameReviewReport {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteStats: Record<MoveClassification, number>;
  blackStats: Record<MoveClassification, number>;
  classifiedMoves: ClassifiedMove[];
  keyMomentIndex?: number;
}

export interface EnginePersonality {
  id: string;
  name: string;
  title: string;
  elo: number;
  avatar: string;
  description: string;
  aggression: number; // 0 to 100
  depth: number;
  hashMb: number;
  limitStrength: boolean;
  playstyle: 'balanced' | 'aggressive' | 'defensive' | 'romantic' | 'blunder_prone';
}

export interface OpeningBookEntry {
  eco: string;
  name: string;
  moves: string[]; // SAN moves e.g. ["e4", "c5", "Nf3", "d6"]
  fen: string;
  winWhite: number;
  draws: number;
  winBlack: number;
  summary: string;
}

export interface SavedGame {
  id: string;
  timestamp: number;
  dateStr: string;
  whiteName: string;
  blackName: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  pgn: string;
  initialFen?: string;
  review?: GameReviewReport;
  mode: 'vs_ai' | 'pass_and_play' | 'analysis';
  personalityId?: string;
}

export interface BranchNode {
  id: string;
  name: string;
  parentMoveIndex: number;
  moves: string[]; // SAN list
  fen: string;
}

export interface EngineSettings {
  hashMb: number;
  threads: number;
  autoThrottle: boolean; // Battery saver / reduce CPU
  showEvalBar: boolean;
  showGhostArrow: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  boardTheme: 'emerald' | 'ocean' | 'obsidian' | 'wood';
  pieceStyle: 'neo' | 'classic' | 'cyberpunk';
}
