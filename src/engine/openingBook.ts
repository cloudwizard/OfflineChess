import { Chess } from 'chess.js';
import { OpeningBookEntry } from '../types/chess';

export interface BookMoveCandidate {
  san: string;
  uci: string;
  weight: number;
  whiteWinRate: number;
  drawRate: number;
  blackWinRate: number;
  openingName: string;
}

export const OPENING_DATABASE: OpeningBookEntry[] = [
  // A - Flank & Irregular
  {
    eco: 'A00',
    name: 'Polish Opening',
    moves: ['b4'],
    fen: 'rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1',
    winWhite: 36,
    draws: 28,
    winBlack: 36,
    summary: 'The Orangutan or Sokolsky opening, attacking Black\'s c5 control from the flank.',
  },
  {
    eco: 'A04',
    name: 'Réti Opening',
    moves: ['Nf3'],
    fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    winWhite: 37,
    draws: 37,
    winBlack: 26,
    summary: 'Hypermodern opening controlling central dark squares before committing central pawns.',
  },
  {
    eco: 'A10',
    name: 'English Opening',
    moves: ['c4'],
    fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1',
    winWhite: 38,
    draws: 36,
    winBlack: 26,
    summary: 'Flexible flank opening controlling d5, often transposing into Queen\'s Gambit or Sicilian structures.',
  },
  {
    eco: 'A20',
    name: 'English Opening: King\'s English Variation',
    moves: ['c4', 'e5'],
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 36,
    draws: 36,
    winBlack: 28,
    summary: 'A reversed Sicilian Defense where White has an extra tempo.',
  },
  {
    eco: 'A51',
    name: 'Budapest Gambit',
    moves: ['d4', 'Nf6', 'c4', 'e5'],
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    winWhite: 42,
    draws: 29,
    winBlack: 29,
    summary: 'Aggressive pawn sacrifice immediately contesting the center.',
  },

  // B - Semi-Open Games (Sicilian, Caro-Kann, etc.)
  {
    eco: 'B01',
    name: 'Scandinavian Defense',
    moves: ['e4', 'd5'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 41,
    draws: 32,
    winBlack: 27,
    summary: 'Direct central counterstrike challenging White\'s e4 pawn on move one.',
  },
  {
    eco: 'B07',
    name: 'Pirc Defense',
    moves: ['e4', 'd6', 'd4', 'Nf6'],
    fen: 'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3',
    winWhite: 42,
    draws: 33,
    winBlack: 25,
    summary: 'Asymmetric defense allowing White a broad pawn center to counterattack dynamically later.',
  },
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: ['e4', 'c6'],
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 37,
    draws: 39,
    winBlack: 24,
    summary: 'Solid, resilient defense preparing ...d5 while keeping the c8 bishop free from obstruction.',
  },
  {
    eco: 'B12',
    name: 'Caro-Kann Defense: Advance Variation',
    moves: ['e4', 'c6', 'd4', 'd5', 'e5'],
    fen: 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    winWhite: 40,
    draws: 34,
    winBlack: 26,
    summary: 'White locks the center and gains space; Black develops ...Bf5 before locking in the light squares.',
  },
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: ['e4', 'c5'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 37,
    draws: 34,
    winBlack: 29,
    summary: 'The most popular and combative response to 1.e4, fighting for d4 asymmetry.',
  },
  {
    eco: 'B27',
    name: 'Sicilian Defense: Open Sicilian',
    moves: ['e4', 'c5', 'Nf3'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    winWhite: 38,
    draws: 34,
    winBlack: 28,
    summary: 'White prepares the central break d2-d4 for maximum piece activity.',
  },
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    winWhite: 39,
    draws: 33,
    winBlack: 28,
    summary: 'Legendary sharp battleground played by Kasparov and Fischer with hyper-complex tactical resources.',
  },
  {
    eco: 'B70',
    name: 'Sicilian Defense: Dragon Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    fen: 'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    winWhite: 43,
    draws: 28,
    winBlack: 29,
    summary: 'Sharp fianchetto formation creating fierce opposite-side castling races in Yugoslav attacks.',
  },

  // C - Open Games (1.e4 e5) & French
  {
    eco: 'C00',
    name: 'French Defense',
    moves: ['e4', 'e6'],
    fen: 'rnbqkbnr/pppp1ppp/4p6/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 39,
    draws: 33,
    winBlack: 28,
    summary: 'Solid positional defense aiming for pawn breaks on c5 and f6 against White\'s e4-d4 center.',
  },
  {
    eco: 'C20',
    name: 'King\'s Pawn Game',
    moves: ['e4', 'e5'],
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 38,
    draws: 34,
    winBlack: 28,
    summary: 'Classical open clash fighting directly for e4 and d5 center squares.',
  },
  {
    eco: 'C42',
    name: 'Petrov\'s Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nf6'],
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    winWhite: 34,
    draws: 46,
    winBlack: 20,
    summary: 'The Russian Defense, famed for rock-solid drawing resilience at elite levels.',
  },
  {
    eco: 'C50',
    name: 'Italian Game',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    winWhite: 39,
    draws: 35,
    winBlack: 26,
    summary: 'One of the oldest recorded openings, targeting the vulnerable f7 square.',
  },
  {
    eco: 'C51',
    name: 'Italian Game: Evans Gambit',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq b3 0 4',
    winWhite: 42,
    draws: 26,
    winBlack: 32,
    summary: 'Romantic sacrificial gambit offering a flank pawn for lightning-fast central development.',
  },
  {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    winWhite: 40,
    draws: 36,
    winBlack: 24,
    summary: 'The bedrock of classical chess theory, exerting structural pressure on Black\'s e5 defender.',
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    winWhite: 34,
    draws: 48,
    winBlack: 18,
    summary: 'The infamous "Berlin Wall" which Kramnik famously used to conquer Garry Kasparov.',
  },

  // D - Closed & Semi-Closed (1.d4 d5)
  {
    eco: 'D00',
    name: 'Queen\'s Pawn Game',
    moves: ['d4', 'd5'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
    winWhite: 38,
    draws: 36,
    winBlack: 26,
    summary: 'Symmetrical solid start leading to strategic central struggles.',
  },
  {
    eco: 'D02',
    name: 'London System',
    moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'],
    fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
    winWhite: 38,
    draws: 38,
    winBlack: 24,
    summary: 'Solid universal setup where White develops dark-squared bishop early outside the pawn chain.',
  },
  {
    eco: 'D06',
    name: 'Queen\'s Gambit',
    moves: ['d4', 'd5', 'c4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
    winWhite: 41,
    draws: 36,
    winBlack: 23,
    summary: 'White offers the c4 pawn to eliminate Black\'s central anchor on d5.',
  },
  {
    eco: 'D30',
    name: 'Queen\'s Gambit Declined',
    moves: ['d4', 'd5', 'c4', 'e6'],
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    winWhite: 39,
    draws: 38,
    winBlack: 23,
    summary: 'Solid classical defense fortifying d5 with the e6 pawn.',
  },
  {
    eco: 'D10',
    name: 'Slav Defense',
    moves: ['d4', 'd5', 'c4', 'c6'],
    fen: 'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    winWhite: 37,
    draws: 40,
    winBlack: 23,
    summary: 'Reinforces d5 without trapping the light-squared bishop inside the pawn chain.',
  },

  // E - Indian Defenses
  {
    eco: 'E60',
    name: 'King\'s Indian Defense',
    moves: ['d4', 'Nf6', 'c4', 'g6'],
    fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    winWhite: 41,
    draws: 32,
    winBlack: 27,
    summary: 'Dynamic hypermodern response where Black builds toward a violent kingside pawn storm.',
  },
  {
    eco: 'E20',
    name: 'Nimzo-Indian Defense',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    winWhite: 36,
    draws: 41,
    winBlack: 23,
    summary: 'Pinning White\'s knight and threatening to double c-pawns while controlling e4.',
  },
  {
    eco: 'E12',
    name: 'Queen\'s Indian Defense',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'],
    fen: 'rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4',
    winWhite: 37,
    draws: 42,
    winBlack: 21,
    summary: 'Fianchettoing the queen\'s bishop on b7 to duel for the key central squares.',
  },
];

// Helper to find opening by matching history moves
export function identifyOpening(sanMoves: string[]): OpeningBookEntry | null {
  if (sanMoves.length === 0) return null;

  let bestMatch: OpeningBookEntry | null = null;
  let maxMatchedMoves = 0;

  for (const entry of OPENING_DATABASE) {
    if (entry.moves.length <= sanMoves.length) {
      let matches = true;
      for (let i = 0; i < entry.moves.length; i++) {
        if (entry.moves[i] !== sanMoves[i]) {
          matches = false;
          break;
        }
      }
      if (matches && entry.moves.length > maxMatchedMoves) {
        maxMatchedMoves = entry.moves.length;
        bestMatch = entry;
      }
    }
  }

  return bestMatch;
}

// Find candidate book continuation moves for the current board position
export function getBookMoves(currentSanMoves: string[]): BookMoveCandidate[] {
  const currentLength = currentSanMoves.length;
  const candidatesMap = new Map<string, BookMoveCandidate>();

  for (const entry of OPENING_DATABASE) {
    if (entry.moves.length > currentLength) {
      // Check prefix match
      let matches = true;
      for (let i = 0; i < currentLength; i++) {
        if (entry.moves[i] !== currentSanMoves[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        const nextSan = entry.moves[currentLength];
        if (!candidatesMap.has(nextSan)) {
          // Reconstruct UCI
          try {
            const tempChess = new Chess();
            for (let i = 0; i < currentLength; i++) {
              tempChess.move(currentSanMoves[i]);
            }
            const moveRes = tempChess.move(nextSan);
            if (moveRes) {
              const uci = moveRes.from + moveRes.to + (moveRes.promotion || '');
              candidatesMap.set(nextSan, {
                san: nextSan,
                uci,
                weight: 1,
                whiteWinRate: entry.winWhite,
                drawRate: entry.draws,
                blackWinRate: entry.winBlack,
                openingName: entry.name,
              });
            }
          } catch {
            // Ignore illegal move reconstruction
          }
        }
      }
    }
  }

  return Array.from(candidatesMap.values());
}
