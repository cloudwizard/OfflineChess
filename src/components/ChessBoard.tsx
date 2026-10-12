import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceColor, PieceType } from '../types/chess';
import { ChessPiece } from './PieceTheme';
import { chessAudio } from '../utils/chessAudio';

interface ChessBoardProps {
  chess: Chess;
  orientation: PieceColor;
  onMove: (move: { from: Square; to: Square; promotion?: string }) => boolean;
  isEngineThinking?: boolean;
  bestMoveUci?: string | null;
  showGhostArrow?: boolean;
  hapticEnabled?: boolean;
  boardTheme?: 'emerald' | 'ocean' | 'obsidian' | 'wood';
  premoveUci?: string | null;
  onSetPremove?: (uci: string | null) => void;
  coachHighlightSq?: Square | null;
  coachTargetSq?: Square | null;
  interactive?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  orientation,
  onMove,
  isEngineThinking = false,
  bestMoveUci = null,
  showGhostArrow = true,
  hapticEnabled = true,
  boardTheme = 'emerald',
  premoveUci = null,
  onSetPremove,
  coachHighlightSq = null,
  coachTargetSq = null,
  interactive = true,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Drag & drop touch state
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // History last move highlight
  const history = chess.history({ verbose: true });
  const lastMove = history[history.length - 1];

  // Trigger tactile vibration
  const triggerHaptic = useCallback(
    (pattern: number | number[]) => {
      if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore
        }
      }
    },
    [hapticEnabled]
  );

  // Determine active board squares order based on orientation
  const files = orientation === 'w' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();

  // Color theme definitions
  const themeStyles = {
    emerald: {
      light: 'bg-[#eeeed2]',
      dark: 'bg-[#769656]',
      textLight: 'text-[#769656]',
      textDark: 'text-[#eeeed2]',
    },
    ocean: {
      light: 'bg-[#d8e2ec]',
      dark: 'bg-[#507299]',
      textLight: 'text-[#507299]',
      textDark: 'text-[#d8e2ec]',
    },
    obsidian: {
      light: 'bg-[#334155]',
      dark: 'bg-[#0f172a]',
      textLight: 'text-slate-400',
      textDark: 'text-slate-300',
    },
    wood: {
      light: 'bg-[#e2c199]',
      dark: 'bg-[#996633]',
      textLight: 'text-[#996633]',
      textDark: 'text-[#e2c199]',
    },
  }[boardTheme];

  // Convert board square string to percentage coordinates for arrows
  const getSquareCenter = useCallback(
    (sq: string) => {
      const file = sq[0];
      const rank = sq[1];
      const colIdx = files.indexOf(file);
      const rowIdx = ranks.indexOf(rank);
      if (colIdx === -1 || rowIdx === -1) return null;
      return {
        x: (colIdx + 0.5) * 12.5,
        y: (rowIdx + 0.5) * 12.5,
      };
    },
    [files, ranks]
  );

  // Update legal moves whenever selected square changes
  useEffect(() => {
    if (!selectedSquare || !interactive) {
      setLegalMoves([]);
      return;
    }
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    setLegalMoves(moves);
  }, [selectedSquare, chess, interactive]);

  // Handle Square Tap
  const handleSquareClick = (sq: Square) => {
    if (!interactive) return;

    // If opponent turn, handle premove
    const isPlayerTurn = chess.turn() === orientation;
    if (!isPlayerTurn && onSetPremove) {
      if (selectedSquare && selectedSquare !== sq) {
        const uci = selectedSquare + sq;
        onSetPremove(uci);
        setSelectedSquare(null);
        triggerHaptic(20);
        return;
      }
      const piece = chess.get(sq);
      if (piece && piece.color === orientation) {
        setSelectedSquare(sq);
        triggerHaptic(15);
      } else {
        setSelectedSquare(null);
        onSetPremove(null);
      }
      return;
    }

    // Player turn
    if (selectedSquare) {
      // Check if clicked square is a legal destination
      const matchedMove = legalMoves.find((m) => m.to === sq);

      if (matchedMove) {
        // Check for pawn promotion
        const piece = chess.get(selectedSquare);
        if (piece && piece.type === 'p' && (sq[1] === '8' || sq[1] === '1')) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          return;
        }

        executeMove(selectedSquare, sq);
        return;
      }

      // Check if clicking another friendly piece
      const targetPiece = chess.get(sq);
      if (targetPiece && targetPiece.color === chess.turn()) {
        setSelectedSquare(sq);
        triggerHaptic(15);
        return;
      }

      // Clear selection
      setSelectedSquare(null);
    } else {
      // Select new piece
      const piece = chess.get(sq);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(sq);
        triggerHaptic(15);
      }
    }
  };

  const executeMove = (from: Square, to: Square, promotion?: string) => {
    const isCapture = chess.get(to) !== null || (chess.get(from)?.type === 'p' && from[0] !== to[0]);
    const success = onMove({ from, to, promotion: promotion || 'q' });

    if (success) {
      setSelectedSquare(null);
      setPendingPromotion(null);
      setLegalMoves([]);

      // Haptic and audio feedback
      if (chess.inCheck()) {
        triggerHaptic([30, 40, 30]);
        chessAudio.playCheck();
      } else if (isCapture) {
        triggerHaptic([25, 30, 25]);
        chessAudio.playCapture();
      } else {
        triggerHaptic(15);
        chessAudio.playMove();
      }
    }
  };

  // Touch Drag & Drop logic
  const handleTouchStart = (sq: Square, e: React.TouchEvent | React.MouseEvent) => {
    if (!interactive) return;
    const piece = chess.get(sq);
    if (!piece || piece.color !== chess.turn()) {
      handleSquareClick(sq);
      return;
    }

    setSelectedSquare(sq);
    setDraggedSquare(sq);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPos({ x: clientX, y: clientY });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!draggedSquare) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPos({ x: clientX, y: clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!draggedSquare || !boardRef.current) {
      setDraggedSquare(null);
      setDragPos(null);
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      const colIdx = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const rowIdx = Math.floor(((clientY - rect.top) / rect.height) * 8);
      const targetFile = files[colIdx];
      const targetRank = ranks[rowIdx];
      const targetSq = (targetFile + targetRank) as Square;

      if (targetSq !== draggedSquare) {
        const isLegal = chess.moves({ square: draggedSquare, verbose: true }).some((m) => m.to === targetSq);
        if (isLegal) {
          const piece = chess.get(draggedSquare);
          if (piece && piece.type === 'p' && (targetSq[1] === '8' || targetSq[1] === '1')) {
            setPendingPromotion({ from: draggedSquare, to: targetSq });
          } else {
            executeMove(draggedSquare, targetSq);
          }
        }
      }
    }

    setDraggedSquare(null);
    setDragPos(null);
  };

  // Find King in check square
  const inCheckSquare = chess.inCheck()
    ? (() => {
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            const p = board[r][f];
            if (p && p.type === 'k' && p.color === chess.turn()) {
              return p.square;
            }
          }
        }
        return null;
      })()
    : null;

  // Compute Ghost Arrow Path
  const ghostArrowData = (() => {
    if (!showGhostArrow || !bestMoveUci || bestMoveUci.length < 4) return null;
    const fromSq = bestMoveUci.substring(0, 2);
    const toSq = bestMoveUci.substring(2, 4);
    const start = getSquareCenter(fromSq);
    const end = getSquareCenter(toSq);
    if (!start || !end) return null;
    return { start, end };
  })();

  // Coach highlight arrow
  const coachArrowData = (() => {
    if (!coachHighlightSq || !coachTargetSq) return null;
    const start = getSquareCenter(coachHighlightSq);
    const end = getSquareCenter(coachTargetSq);
    if (!start || !end) return null;
    return { start, end };
  })();

  return (
    <div className="relative w-full max-w-[480px] aspect-square select-none touch-none shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900">
      {/* 8x8 Board Container */}
      <div
        ref={boardRef}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-8 grid-rows-8 w-full h-full relative"
      >
        {ranks.map((rank, rIdx) =>
          files.map((file, cIdx) => {
            const sq = (file + rank) as Square;
            const piece = chess.get(sq);
            const isLight = (rIdx + cIdx) % 2 === 0;

            const isSelected = selectedSquare === sq;
            const isLastMoveFrom = lastMove?.from === sq;
            const isLastMoveTo = lastMove?.to === sq;
            const isKingInCheck = inCheckSquare === sq;
            const isLegalDest = legalMoves.some((m) => m.to === sq);
            const isLegalCapture = isLegalDest && (piece !== null || (chess.get(selectedSquare || 'a1')?.type === 'p' && selectedSquare?.[0] !== sq[0]));
            const isPremoveFrom = premoveUci?.substring(0, 2) === sq;
            const isPremoveTo = premoveUci?.substring(2, 4) === sq;
            const isCoachHighlight = coachHighlightSq === sq;
            const isCoachTarget = coachTargetSq === sq;

            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(sq)}
                onTouchStart={(e) => handleTouchStart(sq, e)}
                onMouseDown={(e) => handleTouchStart(sq, e)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                  isLight ? themeStyles.light : themeStyles.dark
                } ${isSelected ? '!bg-amber-300/80 shadow-inner' : ''} ${
                  isLastMoveFrom || isLastMoveTo ? '!bg-emerald-400/35' : ''
                } ${isPremoveFrom || isPremoveTo ? '!bg-purple-500/40' : ''} ${
                  isCoachHighlight ? '!bg-cyan-400/40' : ''
                } ${isCoachTarget ? '!bg-cyan-500/50' : ''}`}
              >
                {/* Board Rank Label (on first column) */}
                {cIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] font-bold pointer-events-none select-none opacity-80 ${
                      isLight ? themeStyles.textLight : themeStyles.textDark
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Board File Label (on bottom row) */}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] font-bold pointer-events-none select-none opacity-80 ${
                      isLight ? themeStyles.textLight : themeStyles.textDark
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* King in Check Pulsing Crimson Ring */}
                {isKingInCheck && (
                  <div className="absolute inset-0 bg-red-600/50 rounded-lg animate-pulse ring-2 ring-red-500 z-10 pointer-events-none" />
                )}

                {/* Legal Move Dot */}
                {isLegalDest && !isLegalCapture && (
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-900/30 dark:bg-slate-950/40 pointer-events-none z-20 transition-transform scale-100 animate-in zoom-in-75" />
                )}

                {/* Legal Capture Ring */}
                {isLegalCapture && (
                  <div className="absolute inset-1 rounded-full border-4 border-slate-900/30 dark:border-slate-950/40 pointer-events-none z-20 transition-transform scale-100" />
                )}

                {/* Chess Piece Render */}
                {piece && (draggedSquare !== sq || !dragPos) && (
                  <div className="w-[88%] h-[88%] flex items-center justify-center z-15 pointer-events-none transition-transform duration-100">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Ghost Arrows (Engine best line & Coach hints) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
        <defs>
          {/* Cyan Glow Arrow Marker for Engine Best Move */}
          <marker
            id="engine-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#06b6d4" opacity="0.85" />
          </marker>
          {/* Emerald Coach Arrow Marker */}
          <marker
            id="coach-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#10b981" opacity="0.9" />
          </marker>
        </defs>

        {/* Live Engine Ghost Arrow */}
        {ghostArrowData && (
          <line
            x1={`${ghostArrowData.start.x}%`}
            y1={`${ghostArrowData.start.y}%`}
            x2={`${ghostArrowData.end.x}%`}
            y2={`${ghostArrowData.end.y}%`}
            stroke="#06b6d4"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.75"
            markerEnd="url(#engine-arrowhead)"
            className="transition-all duration-300"
          />
        )}

        {/* Coach Suggestion Arrow */}
        {coachArrowData && (
          <line
            x1={`${coachArrowData.start.x}%`}
            y1={`${coachArrowData.start.y}%`}
            x2={`${coachArrowData.end.x}%`}
            y2={`${coachArrowData.end.y}%`}
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.9"
            markerEnd="url(#coach-arrowhead)"
            className="transition-all duration-200"
          />
        )}
      </svg>

      {/* Dragging floating piece under finger */}
      {draggedSquare && dragPos && boardRef.current && (
        (() => {
          const piece = chess.get(draggedSquare);
          if (!piece) return null;
          const rect = boardRef.current.getBoundingClientRect();
          const relX = dragPos.x - rect.left - rect.width / 16;
          const relY = dragPos.y - rect.top - rect.height / 16;

          return (
            <div
              className="absolute pointer-events-none z-50 w-[12.5%] h-[12.5%] drop-shadow-2xl scale-125 transition-transform"
              style={{
                left: `${relX}px`,
                top: `${relY}px`,
              }}
            >
              <ChessPiece type={piece.type} color={piece.color} />
            </div>
          );
        })()
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Promote Pawn To
            </span>
            <div className="flex gap-2">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => executeMove(pendingPromotion.from, pendingPromotion.to, pType)}
                  className="w-14 h-14 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 transition flex items-center justify-center shadow-lg"
                >
                  <ChessPiece type={pType} color={chess.turn()} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setPendingPromotion(null)}
              className="text-xs text-slate-400 hover:text-slate-200 mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
