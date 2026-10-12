/**
 * Lightweight Offline Endgame Tablebase & Heuristics
 * Exact 3-piece and select 4-piece tablebase knowledge bases
 */
import { Chess } from 'chess.js';

export interface TablebaseEvaluation {
  isTablebase: boolean;
  result: 'win' | 'draw' | 'loss' | null; // From side to move perspective
  dtm: number | null; // Distance to mate (in full moves)
  name: string;
  advice: string;
}

// Convert algebraic coordinate e.g. "e4" to [file(0-7), rank(0-7)]
function toCoords(square: string): [number, number] {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  return [file, rank];
}

// Chebyshev distance (king moves distance between two squares)
function chebyshevDist(sq1: string, sq2: string): number {
  const [f1, r1] = toCoords(sq1);
  const [f2, r2] = toCoords(sq2);
  return Math.max(Math.abs(f1 - f2), Math.abs(r1 - r2));
}

// Distance of square to nearest board edge (0 = corner/edge, 3 = center)
function distToEdge(sq: string): number {
  const [f, r] = toCoords(sq);
  return Math.min(f, 7 - f, r, 7 - r);
}

export function evaluateTablebase(fen: string): TablebaseEvaluation | null {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    const turn = chess.turn(); // 'w' or 'b'

    let whiteKingSq = '';
    let blackKingSq = '';
    const whitePieces: { type: string; square: string }[] = [];
    const blackPieces: { type: string; square: string }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece) {
          const sq = piece.square;
          if (piece.type === 'k') {
            if (piece.color === 'w') whiteKingSq = sq;
            else blackKingSq = sq;
          } else {
            if (piece.color === 'w') whitePieces.push({ type: piece.type, square: sq });
            else blackPieces.push({ type: piece.type, square: sq });
          }
        }
      }
    }

    const totalNonKings = whitePieces.length + blackPieces.length;

    // Only inspect 3-piece and select 4-piece positions
    if (totalNonKings > 2) {
      return null;
    }

    // --- 2 PIECES: K vs K ---
    if (totalNonKings === 0) {
      return {
        isTablebase: true,
        result: 'draw',
        dtm: 0,
        name: 'King vs King',
        advice: 'Dead position. Draw by insufficient material.',
      };
    }

    // --- 3 PIECES: K+X vs K ---
    if (totalNonKings === 1) {
      const isWhiteStrong = whitePieces.length === 1;
      const strongPiece = isWhiteStrong ? whitePieces[0] : blackPieces[0];
      const strongKing = isWhiteStrong ? whiteKingSq : blackKingSq;
      const weakKing = isWhiteStrong ? blackKingSq : whiteKingSq;
      const isStrongTurn = (isWhiteStrong && turn === 'w') || (!isWhiteStrong && turn === 'b');

      // 1. King + Queen vs King (KQK)
      if (strongPiece.type === 'q') {
        const edgeDist = distToEdge(weakKing);
        const kingDist = chebyshevDist(strongKing, weakKing);
        // Estimate DTM based on how close weak king is to edge and strong king proximity
        const estimatedMoves = Math.min(9, Math.max(1, edgeDist * 2 + Math.floor(kingDist / 2) + (isStrongTurn ? 0 : 1)));
        
        return {
          isTablebase: true,
          result: isStrongTurn ? 'win' : 'loss',
          dtm: estimatedMoves,
          name: 'King & Queen vs King (KQK)',
          advice: 'Forced win. Restrict the lone King into the edge/corner, bring your King up, and deliver checkmate.',
        };
      }

      // 2. King + Rook vs King (KRK)
      if (strongPiece.type === 'r') {
        const edgeDist = distToEdge(weakKing);
        const kingDist = chebyshevDist(strongKing, weakKing);
        const estimatedMoves = Math.min(16, Math.max(1, edgeDist * 3 + kingDist + (isStrongTurn ? 0 : 1)));

        return {
          isTablebase: true,
          result: isStrongTurn ? 'win' : 'loss',
          dtm: estimatedMoves,
          name: 'King & Rook vs King (KRK)',
          advice: 'Forced win. Box the opponent King into a smaller rectangle using the Rook, use the King to drive it to the rim, and mate on the edge.',
        };
      }

      // 3. King + Bishop vs King (KBK) or King + Knight vs King (KNK)
      if (strongPiece.type === 'b' || strongPiece.type === 'n') {
        return {
          isTablebase: true,
          result: 'draw',
          dtm: 0,
          name: strongPiece.type === 'b' ? 'King & Bishop vs King' : 'King & Knight vs King',
          advice: 'Immediate draw by insufficient material. Checkmate cannot be forced.',
        };
      }

      // 4. King + Pawn vs King (KPK) - Key squares & Opposition
      if (strongPiece.type === 'p') {
        const [, pRank] = toCoords(strongPiece.square);
        const [pFile] = toCoords(strongPiece.square);
        const [wkFile, wkRank] = toCoords(weakKing);
        const [skFile, skRank] = toCoords(strongKing);

        // Normalized relative rank from pawn's promotion direction
        const relPRank = isWhiteStrong ? pRank : 7 - pRank;
        const relWKRank = isWhiteStrong ? wkRank : 7 - wkRank;
        const relSKRank = isWhiteStrong ? skRank : 7 - skRank;

        // Check if defending king is in front of the pawn
        const isDefendingInFront = wkFile === pFile && relWKRank > relPRank;
        // Key squares: For pawn on 2nd-4th rank: 2 ranks ahead (files -1, 0, +1).
        // For pawn on 5th-6th rank: 1 rank ahead.
        const isStrongKingInFront = relSKRank > relPRank && Math.abs(skFile - pFile) <= 1;

        // Rook pawn (a or h file) check
        const isRookPawn = pFile === 0 || pFile === 7;
        if (isRookPawn && isDefendingInFront) {
          return {
            isTablebase: true,
            result: 'draw',
            dtm: null,
            name: 'King & Rook-Pawn vs King (KPK)',
            advice: 'Theoretical Draw. Lone King reaches the corner square (a8/h8/a1/h1) and cannot be dislodged without stalemate.',
          };
        }

        // Opposition evaluation
        const hasOpposition = Math.abs(wkRank - skRank) === 2 && wkFile === skFile;
        let isWinning = false;

        if (relPRank >= 5) {
          // Pawn on 6th rank: if attacking king is in front, it's generally a win
          isWinning = isStrongKingInFront || (relSKRank >= 5 && Math.abs(skFile - pFile) <= 1);
        } else if (isStrongKingInFront && (!isDefendingInFront || hasOpposition)) {
          isWinning = true;
        }

        const movesToPromote = (7 - relPRank) + 5; // Promotion + queen mate

        return {
          isTablebase: true,
          result: isWinning ? (isStrongTurn ? 'win' : 'loss') : 'draw',
          dtm: isWinning ? movesToPromote : null,
          name: 'King & Pawn vs King (KPK)',
          advice: isWinning
            ? 'Winning key square control. Secure the square in front of the pawn and march down to queen.'
            : 'Theoretical Draw by Opposition. Defending King maintains the direct vertical opposition, forcing stalemate.',
        };
      }
    }

    // --- 4 PIECES: K+X vs K+Y or K+2X vs K ---
    if (totalNonKings === 2) {
      // 1. King + 2 Bishops vs King (KBBK)
      if ((whitePieces.length === 2 && whitePieces.every((p) => p.type === 'b')) ||
          (blackPieces.length === 2 && blackPieces.every((p) => p.type === 'b'))) {
        const isWhiteStrong = whitePieces.length === 2;
        const isStrongTurn = (isWhiteStrong && turn === 'w') || (!isWhiteStrong && turn === 'b');
        return {
          isTablebase: true,
          result: isStrongTurn ? 'win' : 'loss',
          dtm: 18,
          name: 'King & Two Bishops vs King (KBBK)',
          advice: 'Forced win. The two bishops create a barrier of diagonal lasers pushing the enemy king into the corner for mate.',
        };
      }

      // 2. King + Bishop + Knight vs King (KBNK)
      if ((whitePieces.length === 2 && whitePieces.some((p) => p.type === 'b') && whitePieces.some((p) => p.type === 'n')) ||
          (blackPieces.length === 2 && blackPieces.some((p) => p.type === 'b') && blackPieces.some((p) => p.type === 'n'))) {
        const isWhiteStrong = whitePieces.length === 2;
        const isStrongTurn = (isWhiteStrong && turn === 'w') || (!isWhiteStrong && turn === 'b');
        return {
          isTablebase: true,
          result: isStrongTurn ? 'win' : 'loss',
          dtm: 32,
          name: 'King, Bishop & Knight vs King (KBNK)',
          advice: 'Forced win via W-maneuver. Drive enemy King toward the corner matching the Bishop color.',
        };
      }

      // 3. King & Queen vs King & Rook (KQvKR)
      if ((whitePieces.length === 1 && whitePieces[0].type === 'q' && blackPieces.length === 1 && blackPieces[0].type === 'r') ||
          (blackPieces.length === 1 && blackPieces[0].type === 'q' && whitePieces.length === 1 && whitePieces[0].type === 'r')) {
        const isWhiteStrong = whitePieces[0]?.type === 'q';
        const isStrongTurn = (isWhiteStrong && turn === 'w') || (!isWhiteStrong && turn === 'b');
        return {
          isTablebase: true,
          result: isStrongTurn ? 'win' : 'loss',
          dtm: 25,
          name: 'King & Queen vs King & Rook (KQvKR)',
          advice: 'The Queen side wins by Philidor triangulation, forking the Rook away from the enemy King.',
        };
      }

      // 4. King & Rook vs King & Rook (KRvKR)
      if (whitePieces.length === 1 && whitePieces[0].type === 'r' && blackPieces.length === 1 && blackPieces[0].type === 'r') {
        return {
          isTablebase: true,
          result: 'draw',
          dtm: null,
          name: 'King & Rook vs King & Rook (KRvKR)',
          advice: 'Theoretical Draw under correct play. Keep active rook checks from a safe distance.',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
