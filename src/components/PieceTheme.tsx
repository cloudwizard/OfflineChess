import React from 'react';
import { PieceColor, PieceType } from '../types/chess';

export interface PieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // High contrast palette: crisp ivory white with soft border vs deep obsidian black with subtle silver bevel
  const fill = isWhite ? '#ffffff' : '#1e2430';
  const stroke = isWhite ? '#1e293b' : '#f1f5f9';
  const strokeWidth = 1.5;

  const renderPath = () => {
    switch (type) {
      case 'p':
        return (
          <g>
            <path
              d="M 22 10 A 5 5 0 1 1 23 10 M 17 29 C 17 25 20 22 22.5 19 C 25 22 28 25 28 29 Z M 14 36 L 31 36 L 31 32 L 14 32 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isWhite && (
              <path d="M 19 12 A 2 2 0 1 1 20 12" fill="#e2e8f0" opacity="0.6" />
            )}
          </g>
        );

      case 'r':
        return (
          <g>
            <path
              d="M 12 36 L 33 36 L 33 32 L 12 32 Z M 14 32 L 17 28 L 28 28 L 31 32 Z M 16 28 L 16 16 L 29 16 L 29 28 Z M 13 16 L 13 11 L 17 11 L 17 13 L 21 13 L 21 11 L 24 11 L 24 13 L 28 13 L 28 11 L 32 11 L 32 16 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'n':
        return (
          <g>
            <path
              d="M 12 36 L 33 36 L 32 32 L 13 32 Z M 13 32 C 13 28 15 26 18 25 C 16 22 14 18 14 14 C 14 10 18 8 22 8 C 26 8 30 11 31 15 C 32 19 30 23 29 25 C 31 27 32 29 32 32 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 20 13 A 1.5 1.5 0 1 1 20.1 13"
              fill={isWhite ? '#0f172a' : '#ffffff'}
            />
            <path
              d="M 17 18 C 18 19 21 19 22 18"
              fill="none"
              stroke={stroke}
              strokeWidth={1.2}
            />
          </g>
        );

      case 'b':
        return (
          <g>
            <path
              d="M 12 36 L 33 36 L 32 32 L 13 32 Z M 15 32 C 16 26 19 23 22.5 18 C 26 23 29 26 30 32 Z M 22.5 18 C 25.5 16 27 12 22.5 9 C 18 12 19.5 16 22.5 18 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="22.5" cy="7.5" r="1.5" fill={fill} stroke={stroke} strokeWidth={1} />
            <path d="M 20 13 L 25 15" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
          </g>
        );

      case 'q':
        return (
          <g>
            <path
              d="M 11 36 L 34 36 L 33 32 L 12 32 Z M 14 32 C 16 27 18 23 22.5 21 C 27 23 29 27 31 32 Z M 12 18 L 16 27 L 22.5 16 L 29 27 L 33 18 L 30 29 L 15 29 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="16" r="1.5" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="22.5" cy="14" r="1.5" fill={fill} stroke={stroke} strokeWidth={1} />
            <circle cx="33" cy="16" r="1.5" fill={fill} stroke={stroke} strokeWidth={1} />
          </g>
        );

      case 'k':
        return (
          <g>
            <path
              d="M 11 36 L 34 36 L 33 32 L 12 32 Z M 14 32 C 16 26 18 23 22.5 20 C 27 23 29 26 31 32 Z M 15 20 C 13 14 18 11 22.5 14 C 27 11 32 14 30 20 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Royal Cross */}
            <path
              d="M 22.5 6 L 22.5 11 M 20 8.5 L 25 8.5"
              stroke={stroke}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} drop-shadow-md transition-transform duration-150 pointer-events-none select-none`}
    >
      {renderPath()}
    </svg>
  );
};
