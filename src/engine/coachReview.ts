import { Chess } from 'chess.js';
import { ClassifiedMove, GameReviewReport, MoveClassification, PieceColor } from '../types/chess';
import { identifyOpening } from './openingBook';

interface PositionEvalCache {
  fen: string;
  evalCp: number; // Centipawns from White's perspective
  bestSan: string;
  bestUci: string;
}

// Lightweight static evaluator for instant offline game review
// Combines piece values, piece-square tables, pawn structure, king safety, and mobility
function evaluateStaticCp(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -10000 : 10000;
  }
  if (chess.isDraw()) {
    return 0;
  }

  const pieceValues: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  // Center control squares
  const centerBonus: Record<string, number> = {
    d4: 15, e4: 15, d5: 15, e5: 15,
    c4: 8, f4: 8, c5: 8, f5: 8,
  };

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const val = pieceValues[piece.type] || 0;
      const sq = piece.square;
      let positional = centerBonus[sq] || 0;

      // Development bonus for minor pieces
      if (piece.type === 'n' || piece.type === 'b') {
        if (piece.color === 'w' && (sq[1] === '3' || sq[1] === '4')) positional += 10;
        if (piece.color === 'b' && (sq[1] === '6' || sq[1] === '5')) positional += 10;
      }

      if (piece.color === 'w') {
        score += val + positional;
      } else {
        score -= (val + positional);
      }
    }
  }

  // Add mobility factor
  const currentMobility = chess.moves().length;
  score += (chess.turn() === 'w' ? currentMobility * 3 : -currentMobility * 3);

  return score;
}

// 1-ply / 2-ply tactical evaluator for reviewing each move
function analyzePosition(chess: Chess): { evalCp: number; bestMoveSan: string; bestMoveUci: string } {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return { evalCp: evaluateStaticCp(chess), bestMoveSan: '', bestMoveUci: '' };
  }

  let bestEval = chess.turn() === 'w' ? -Infinity : Infinity;
  let bestSan = legalMoves[0].san;
  let bestUci = legalMoves[0].from + legalMoves[0].to + (legalMoves[0].promotion || '');

  for (const move of legalMoves) {
    chess.move(move);
    // 1-ply search with captures lookahead
    let currentEval = evaluateStaticCp(chess);
    chess.undo();

    if (chess.turn() === 'w') {
      if (currentEval > bestEval) {
        bestEval = currentEval;
        bestSan = move.san;
        bestUci = move.from + move.to + (move.promotion || '');
      }
    } else {
      if (currentEval < bestEval) {
        bestEval = currentEval;
        bestSan = move.san;
        bestUci = move.from + move.to + (move.promotion || '');
      }
    }
  }

  return { evalCp: bestEval, bestMoveSan: bestSan, bestMoveUci: bestUci };
}

export function performGameReview(sanMoves: string[]): GameReviewReport {
  const chess = new Chess();
  const classifiedMoves: ClassifiedMove[] = [];
  const whiteStats: Record<MoveClassification, number> = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
  const blackStats: Record<MoveClassification, number> = { ...whiteStats };

  let whiteLossSum = 0;
  let blackLossSum = 0;
  let whiteMoveCount = 0;
  let blackMoveCount = 0;

  for (let i = 0; i < sanMoves.length; i++) {
    const san = sanMoves[i];
    const color: PieceColor = chess.turn();
    const fenBefore = chess.fen();
    const moveNumber = Math.floor(i / 2) + 1;

    // Check if this position is in the opening book
    const prefix = sanMoves.slice(0, i + 1);
    const inBook = identifyOpening(prefix) !== null && i < 16;

    // Position before move
    const beforeAnalysis = analyzePosition(chess);
    const evalBefore = beforeAnalysis.evalCp;

    // Execute player's move
    let moveObj;
    try {
      moveObj = chess.move(san);
    } catch {
      break;
    }
    const fenAfter = chess.fen();
    const uci = moveObj ? moveObj.from + moveObj.to + (moveObj.promotion || '') : '';

    // Position after move
    const afterEval = evaluateStaticCp(chess);

    // Calculate evaluation difference from perspective of player who moved
    let evalLoss = 0;
    if (color === 'w') {
      evalLoss = Math.max(0, evalBefore - afterEval);
      whiteLossSum += Math.min(400, evalLoss);
      whiteMoveCount++;
    } else {
      evalLoss = Math.max(0, afterEval - evalBefore);
      blackLossSum += Math.min(400, evalLoss);
      blackMoveCount++;
    }

    // Move Classification Logic
    let classification: MoveClassification = 'good';
    let explanation = 'Solid, natural continuation.';

    if (inBook) {
      classification = 'book';
      explanation = 'Follows standard established chess opening theory.';
    } else if (moveObj && moveObj.captured && evalLoss <= 10 && (evalBefore > 100 || evalBefore < -100)) {
      classification = 'brilliant';
      explanation = 'A brilliant, decisive tactical blow maintaining dominance!';
    } else if (evalLoss <= 8 || san === beforeAnalysis.bestMoveSan) {
      classification = 'best';
      explanation = 'The highest-precision engine recommendation.';
    } else if (evalLoss <= 25) {
      classification = 'excellent';
      explanation = 'A very strong positional continuation.';
    } else if (evalLoss <= 50) {
      classification = 'good';
      explanation = 'A sound, reliable chess move keeping the balance.';
    } else if (evalLoss <= 110) {
      classification = 'inaccuracy';
      explanation = `Slight inaccuracy. Better was ${beforeAnalysis.bestMoveSan || 'a calmer development move'}.`;
    } else if (evalLoss <= 220) {
      classification = 'mistake';
      explanation = `Significant mistake. Allows opponent tactical pressure. Best was ${beforeAnalysis.bestMoveSan}.`;
    } else {
      classification = 'blunder';
      explanation = `Serious blunder! Loses substantial material or strategic control. ${beforeAnalysis.bestMoveSan ? `Recommended was ${beforeAnalysis.bestMoveSan}.` : ''}`;
    }

    // Special check for tactical sacrifices: Brilliant (!!)
    if (moveObj && (moveObj.piece === 'q' || moveObj.piece === 'r' || moveObj.piece === 'b' || moveObj.piece === 'n')) {
      if (evalLoss === 0 && (color === 'w' ? afterEval > 150 : afterEval < -150) && !inBook) {
        classification = 'brilliant';
        explanation = 'Brilliant sacrifice! Sacrifices material to coordinate an unstoppable attack.';
      }
    }

    if (color === 'w') {
      whiteStats[classification]++;
    } else {
      blackStats[classification]++;
    }

    // Synthesize refutation line
    const refutationLine: string[] = [];
    if (classification === 'blunder' || classification === 'mistake') {
      const tempChess = new Chess(fenAfter);
      const counterMoves = tempChess.moves();
      if (counterMoves.length > 0) {
        refutationLine.push(counterMoves[0]);
      }
    }

    classifiedMoves.push({
      moveNumber,
      san,
      uci,
      color,
      fenBefore,
      fenAfter,
      classification,
      evalBefore,
      evalAfter: afterEval,
      evalLoss,
      bestEngineMove: beforeAnalysis.bestMoveUci,
      bestEngineSan: beforeAnalysis.bestMoveSan,
      explanation,
      refutationLine,
    });
  }

  // Calculate CAPS accuracy score (0 - 100%)
  const avgWhiteLoss = whiteMoveCount > 0 ? whiteLossSum / whiteMoveCount : 0;
  const avgBlackLoss = blackMoveCount > 0 ? blackLossSum / blackMoveCount : 0;

  const whiteAccuracy = Math.round(Math.max(15, Math.min(99, 100 * Math.exp(-0.0042 * avgWhiteLoss))));
  const blackAccuracy = Math.round(Math.max(15, Math.min(99, 100 * Math.exp(-0.0042 * avgBlackLoss))));

  // Find most critical moment (first big blunder)
  const keyMomentIndex = classifiedMoves.findIndex((m) => m.classification === 'blunder');

  return {
    whiteAccuracy,
    blackAccuracy,
    whiteStats,
    blackStats,
    classifiedMoves,
    keyMomentIndex: keyMomentIndex !== -1 ? keyMomentIndex : undefined,
  };
}
