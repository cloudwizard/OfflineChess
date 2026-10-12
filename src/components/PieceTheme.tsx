import React from 'react';
import { PieceColor, PieceType } from '../types/chess';

export interface PieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  style?: 'neo' | 'classic' | 'cyberpunk';
}

export const ChessPiece: React.FC<PieceProps> = ({
  type,
  color,
  className = 'w-full h-full',
  style = 'neo',
}) => {
  const isWhite = color === 'w';

  // Palette configuration based on piece style
  const config = {
    neo: {
      whiteFill: 'url(#whiteNeoGrad)',
      whiteStroke: '#1e293b',
      whiteAccent: '#64748b',
      whiteHighlight: '#ffffff',
      blackFill: 'url(#blackNeoGrad)',
      blackStroke: '#090d16',
      blackAccent: '#e2e8f0',
      blackHighlight: '#94a3b8',
    },
    classic: {
      whiteFill: '#f8fafc',
      whiteStroke: '#0f172a',
      whiteAccent: '#475569',
      whiteHighlight: '#ffffff',
      blackFill: '#1e293b',
      blackStroke: '#020617',
      blackAccent: '#f8fafc',
      blackHighlight: '#94a3b8',
    },
    cyberpunk: {
      whiteFill: 'url(#cyberWhiteGrad)',
      whiteStroke: '#06b6d4',
      whiteAccent: '#38bdf8',
      whiteHighlight: '#a5f3fc',
      blackFill: 'url(#cyberBlackGrad)',
      blackStroke: '#10b981',
      blackAccent: '#34d399',
      blackHighlight: '#6ee7b7',
    },
  }[style];

  const fill = isWhite ? config.whiteFill : config.blackFill;
  const stroke = isWhite ? config.whiteStroke : config.blackStroke;
  const accent = isWhite ? config.whiteAccent : config.blackAccent;
  const highlight = isWhite ? config.whiteHighlight : config.blackHighlight;
  const strokeWidth = style === 'cyberpunk' ? 1.6 : 1.4;

  const renderPieceSvg = () => {
    switch (type) {
      // ==================== PAWN ====================
      case 'p':
        return isWhite ? (
          <g>
            {/* Base and pedestal */}
            <path
              d="M 22.5 9 C 19.5 9 17 11.2 17 14 C 17 16.3 18.5 18.2 20.6 18.8 C 17.5 21 15 25 15 29 C 15 31.8 16.5 33.5 19 34.5 C 16.5 35 12 36.5 12 39.5 L 33 39.5 C 33 36.5 28.5 35 26 34.5 C 28.5 33.5 30 31.8 30 29 C 30 25 27.5 21 24.4 18.8 C 26.5 18.2 28 16.3 28 14 C 28 11.2 25.5 9 22.5 9 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Collar rim line */}
            <path
              d="M 18.5 19 C 20.5 19.8 24.5 19.8 26.5 19"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            {/* Waist base trim */}
            <path
              d="M 16 34.5 C 20 33.5 25 33.5 29 34.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            {/* Specular head highlight */}
            <circle cx="21" cy="12.5" r="2.2" fill={highlight} opacity={0.6} />
          </g>
        ) : (
          <g>
            <path
              d="M 22.5 9 C 19.5 9 17 11.2 17 14 C 17 16.3 18.5 18.2 20.6 18.8 C 17.5 21 15 25 15 29 C 15 31.8 16.5 33.5 19 34.5 C 16.5 35 12 36.5 12 39.5 L 33 39.5 C 33 36.5 28.5 35 26 34.5 C 28.5 33.5 30 31.8 30 29 C 30 25 27.5 21 24.4 18.8 C 26.5 18.2 28 16.3 28 14 C 28 11.2 25.5 9 22.5 9 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 18.5 19 C 20.5 19.8 24.5 19.8 26.5 19"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 16 34.5 C 20 33.5 25 33.5 29 34.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <circle cx="21" cy="12.5" r="2.2" fill={highlight} opacity={0.4} />
          </g>
        );

      // ==================== ROOK ====================
      case 'r':
        return isWhite ? (
          <g>
            {/* Base */}
            <path
              d="M 9 39 L 36 39 L 36 36 L 9 36 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Plinth */}
            <path
              d="M 12 36 L 12 32 L 33 32 L 33 36 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tower Body */}
            <path
              d="M 12.5 32 L 14 16 L 31 16 L 32.5 32 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crenellated Parapet */}
            <path
              d="M 11 16 L 11 9 L 15 9 L 15 12 L 20 12 L 20 9 L 25 9 L 25 12 L 30 12 L 30 9 L 34 9 L 34 16 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Masonry line */}
            <path d="M 13 16 L 32 16" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
            <path d="M 14 30 L 31 30" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
            <path d="M 15 22 L 30 22" stroke={accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          </g>
        ) : (
          <g>
            <path
              d="M 9 39 L 36 39 L 36 36 L 9 36 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 12 36 L 12 32 L 33 32 L 33 36 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 12.5 32 L 14 16 L 31 16 L 32.5 32 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 11 16 L 11 9 L 15 9 L 15 12 L 20 12 L 20 9 L 25 9 L 25 12 L 30 12 L 30 9 L 34 9 L 34 16 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M 13 16 L 32 16" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
            <path d="M 14 30 L 31 30" stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
            <path d="M 15 22 L 30 22" stroke={accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          </g>
        );

      // ==================== KNIGHT ====================
      case 'n':
        return isWhite ? (
          <g>
            {/* Master Knight Contour */}
            <path
              d="M 22 9.5 C 24.5 9 27 10 28.5 12 C 30 14 30.5 16 32 17.5 C 33.5 19 35 19.5 35.5 21 C 36 22.5 35 24 33.5 24.5 L 32.5 24 C 30 22.5 28 22 27 23.5 C 25.5 25.5 26.5 28.5 27 30 C 27.5 31.5 28.5 33 29 34.5 C 29.5 36 30 37.5 31 39 L 14 39 C 14 36.5 13.5 34.5 12.5 33 C 11 31 9 29.5 8.5 27.5 C 8 25.5 8.5 24 9.5 23 C 11 21.5 13 21 14 20 C 13.5 18.5 12.5 17 12 15 C 11.5 13 12 11 13.5 10 C 15 9 17 9.5 18 11 C 19 9.8 20.5 9.2 22 9.5 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Mane Tufts */}
            <path
              d="M 21.5 12 C 24 13.5 26 16.5 27 19.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 24 18 C 26 20 28 22.5 28.5 25.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            {/* Muzzle curve and nostril */}
            <path
              d="M 10 23.5 C 11.5 24 13 23.5 14 22.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <circle cx="11.5" cy="22" r="0.8" fill={stroke} />
            {/* Intelligent Eye */}
            <ellipse cx="16.5" cy="14" rx="1.5" ry="2" fill={stroke} />
            <circle cx="16" cy="13.5" r="0.6" fill={highlight} />
            {/* Ear */}
            <path
              d="M 18 10.5 L 19.5 7 L 21.5 10"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            {/* Jaw line */}
            <path
              d="M 14 20 C 16.5 21 19 20 21 18"
              fill="none"
              stroke={accent}
              strokeWidth={1.1}
            />
          </g>
        ) : (
          <g>
            <path
              d="M 22 9.5 C 24.5 9 27 10 28.5 12 C 30 14 30.5 16 32 17.5 C 33.5 19 35 19.5 35.5 21 C 36 22.5 35 24 33.5 24.5 L 32.5 24 C 30 22.5 28 22 27 23.5 C 25.5 25.5 26.5 28.5 27 30 C 27.5 31.5 28.5 33 29 34.5 C 29.5 36 30 37.5 31 39 L 14 39 C 14 36.5 13.5 34.5 12.5 33 C 11 31 9 29.5 8.5 27.5 C 8 25.5 8.5 24 9.5 23 C 11 21.5 13 21 14 20 C 13.5 18.5 12.5 17 12 15 C 11.5 13 12 11 13.5 10 C 15 9 17 9.5 18 11 C 19 9.8 20.5 9.2 22 9.5 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 21.5 12 C 24 13.5 26 16.5 27 19.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 24 18 C 26 20 28 22.5 28.5 25.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 10 23.5 C 11.5 24 13 23.5 14 22.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <circle cx="11.5" cy="22" r="0.8" fill={accent} />
            <ellipse cx="16.5" cy="14" rx="1.5" ry="2" fill={accent} />
            <circle cx="16" cy="13.5" r="0.6" fill={fill} />
            <path
              d="M 18 10.5 L 19.5 7 L 21.5 10"
              fill={fill}
              stroke={stroke}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            <path
              d="M 14 20 C 16.5 21 19 20 21 18"
              fill="none"
              stroke={accent}
              strokeWidth={1.1}
            />
          </g>
        );

      // ==================== BISHOP ====================
      case 'b':
        return isWhite ? (
          <g>
            {/* Base Plinth */}
            <path
              d="M 10 39 L 35 39 L 34 35 L 11 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Waist and Mitre Body */}
            <path
              d="M 14 35 C 14 32 16 30 18 28.5 C 16 26.5 14.5 23 15 19 C 15.5 15 18 11.5 22.5 9.5 C 27 11.5 29.5 15 30 19 C 30.5 23 29 26.5 27 28.5 C 29 30 31 32 31 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Top Finial Ball */}
            <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth={1.2} />
            {/* Mitre Cleft (The signature diagonal incision) */}
            <path
              d="M 21 13 L 26.5 18.5"
              fill="none"
              stroke={stroke}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            {/* Cross/Robe Collar */}
            <path
              d="M 17.5 28.5 C 20.5 29.5 24.5 29.5 27.5 28.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 22.5 22 L 22.5 27 M 20.5 24 L 24.5 24"
              stroke={accent}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g>
            <path
              d="M 10 39 L 35 39 L 34 35 L 11 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 14 35 C 14 32 16 30 18 28.5 C 16 26.5 14.5 23 15 19 C 15.5 15 18 11.5 22.5 9.5 C 27 11.5 29.5 15 30 19 C 30.5 23 29 26.5 27 28.5 C 29 30 31 32 31 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth={1.2} />
            <path
              d="M 21 13 L 26.5 18.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M 17.5 28.5 C 20.5 29.5 24.5 29.5 27.5 28.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <path
              d="M 22.5 22 L 22.5 27 M 20.5 24 L 24.5 24"
              stroke={accent}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
          </g>
        );

      // ==================== QUEEN ====================
      case 'q':
        return isWhite ? (
          <g>
            {/* Base */}
            <path
              d="M 9 39 L 36 39 L 35 35 L 10 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Flared Gown Waist */}
            <path
              d="M 12 35 C 13.5 31 16 27 18 25 C 16 24 14 22 13 20 C 18 22 27 22 32 20 C 31 22 29 24 27 25 C 29 27 31.5 31 33 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 5-Spire Coronet */}
            <path
              d="M 10 20 L 7 13 L 14.5 17.5 L 17 10 L 22.5 17 L 28 10 L 30.5 17.5 L 38 13 L 35 20 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Coronet Pearls */}
            <circle cx="7" cy="12" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="17" cy="9" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="22.5" cy="7" r="2.2" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="28" cy="9" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="38" cy="12" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            {/* Crown band and jewels */}
            <path d="M 12 21 C 18 22.5 27 22.5 33 21" stroke={accent} strokeWidth={1.2} />
            <circle cx="22.5" cy="27" r="1.5" fill={accent} />
            <circle cx="18" cy="28.5" r="1.2" fill={accent} opacity={0.7} />
            <circle cx="27" cy="28.5" r="1.2" fill={accent} opacity={0.7} />
          </g>
        ) : (
          <g>
            <path
              d="M 9 39 L 36 39 L 35 35 L 10 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 12 35 C 13.5 31 16 27 18 25 C 16 24 14 22 13 20 C 18 22 27 22 32 20 C 31 22 29 24 27 25 C 29 27 31.5 31 33 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 10 20 L 7 13 L 14.5 17.5 L 17 10 L 22.5 17 L 28 10 L 30.5 17.5 L 38 13 L 35 20 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7" cy="12" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="17" cy="9" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="22.5" cy="7" r="2.2" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="28" cy="9" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="38" cy="12" r="1.8" fill={fill} stroke={stroke} strokeWidth={1} />
            <path d="M 12 21 C 18 22.5 27 22.5 33 21" stroke={accent} strokeWidth={1.2} />
            <circle cx="22.5" cy="27" r="1.5" fill={accent} />
            <circle cx="18" cy="28.5" r="1.2" fill={accent} opacity={0.7} />
            <circle cx="27" cy="28.5" r="1.2" fill={accent} opacity={0.7} />
          </g>
        );

      // ==================== KING ====================
      case 'k':
        return isWhite ? (
          <g>
            {/* Base */}
            <path
              d="M 9 39 L 36 39 L 35 35 L 10 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Waist and Mantle Robe */}
            <path
              d="M 12 35 C 13.5 31.5 15.5 27.5 17.5 25 C 15 24 13.5 21 14 17.5 C 14.5 14 17.5 12 22.5 12 C 27.5 12 30.5 14 31 17.5 C 31.5 21 30 24 27.5 25 C 29.5 27.5 31.5 31.5 33 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Imperial Crown Arch */}
            <path
              d="M 17 17.5 C 18.5 15 20.5 13.5 22.5 13.5 C 24.5 13.5 26.5 15 28 17.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.3}
            />
            {/* Royal Cross Pattée */}
            <path
              d="M 22.5 4.5 L 22.5 11.5 M 19 7.5 L 26 7.5"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Robe Collar & Jewels */}
            <path
              d="M 15 25 C 19 26.5 26 26.5 30 25"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <circle cx="22.5" cy="20" r="1.8" fill={accent} />
            <circle cx="18" cy="20" r="1.3" fill={accent} opacity={0.7} />
            <circle cx="27" cy="20" r="1.3" fill={accent} opacity={0.7} />
          </g>
        ) : (
          <g>
            <path
              d="M 9 39 L 36 39 L 35 35 L 10 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 12 35 C 13.5 31.5 15.5 27.5 17.5 25 C 15 24 13.5 21 14 17.5 C 14.5 14 17.5 12 22.5 12 C 27.5 12 30.5 14 31 17.5 C 31.5 21 30 24 27.5 25 C 29.5 27.5 31.5 31.5 33 35 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 17 17.5 C 18.5 15 20.5 13.5 22.5 13.5 C 24.5 13.5 26.5 15 28 17.5"
              fill="none"
              stroke={accent}
              strokeWidth={1.3}
            />
            <path
              d="M 22.5 4.5 L 22.5 11.5 M 19 7.5 L 26 7.5"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M 15 25 C 19 26.5 26 26.5 30 25"
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <circle cx="22.5" cy="20" r="1.8" fill={accent} />
            <circle cx="18" cy="20" r="1.3" fill={accent} opacity={0.7} />
            <circle cx="27" cy="20" r="1.3" fill={accent} opacity={0.7} />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] transition-transform duration-150 pointer-events-none select-none`}
    >
      <defs>
        {/* White Porcelain/Ivory Gradient */}
        <linearGradient id="whiteNeoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Black Obsidian Graphite Gradient */}
        <linearGradient id="blackNeoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Cyberpunk Neon Gradients */}
        <linearGradient id="cyberWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
        <linearGradient id="cyberBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
      </defs>

      {renderPieceSvg()}
    </svg>
  );
};
