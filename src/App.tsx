import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  FlipHorizontal,
  Settings as SettingsIcon,
  BookOpen,
  Award,
  History,
  Play,
  RotateCw,
  Sparkles,
  Cpu,
  HelpCircle,
  Flag,
  Share2,
} from 'lucide-react';

import { PieceColor, EngineEvaluation, GameReviewReport, EnginePersonality, EngineSettings, SavedGame } from './types/chess';
import { engineService } from './engine/engineService';
import { ENGINE_PERSONALITIES } from './engine/personalities';
import { evaluateTablebase } from './engine/tablebase';
import { performGameReview } from './engine/coachReview';
import { saveGameToDb, saveActiveGameState, loadActiveGameState, clearActiveGameState } from './db/gameStorage';
import { chessAudio } from './utils/chessAudio';

import { ChessBoard } from './components/ChessBoard';
import { EvaluationBar } from './components/EvaluationBar';
import { NotationPane } from './components/NotationPane';
import { OpeningExplorer } from './components/OpeningExplorer';
import { PassAndPlayBar } from './components/PassAndPlay';
import { CoachReviewModal } from './components/CoachReviewModal';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { PersonalityModal } from './components/PersonalityModal';
import { GameHistoryModal } from './components/GameHistoryModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Core Chess State
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [sanHistory, setSanHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  // Game Settings & Modes
  const [mode, setMode] = useState<'vs_ai' | 'pass_and_play' | 'analysis'>('vs_ai');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [boardOrientation, setBoardOrientation] = useState<PieceColor>('w');
  const [personality, setPersonality] = useState<EnginePersonality>(ENGINE_PERSONALITIES[0]);
  const [settings, setSettings] = useState<EngineSettings>({
    hashMb: 16,
    threads: 1,
    autoThrottle: true,
    showEvalBar: true,
    showGhostArrow: true,
    hapticFeedback: true,
    soundEffects: true,
    boardTheme: 'emerald',
  });

  // Engine evaluation state
  const [evaluation, setEvaluation] = useState<EngineEvaluation>({
    depth: 0,
    scoreCp: 0,
    scoreMate: null,
    bestMove: null,
    bestLine: [],
    nodes: 0,
    nps: 0,
    timeMs: 0,
  });
  const [isEngineThinking, setIsEngineThinking] = useState(false);

  // Active Premove
  const [premoveUci, setPremoveUci] = useState<string | null>(null);

  // Pass-and-play Clock State
  const [whiteTimeMs, setWhiteTimeMs] = useState(10 * 60 * 1000); // 10 mins
  const [blackTimeMs, setBlackTimeMs] = useState(10 * 60 * 1000);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [autoRotatePassAndPlay, setAutoRotatePassAndPlay] = useState(false);

  // "What If" Speculative Branching State
  const [isBranching, setIsBranching] = useState(false);
  const [masterHistory, setMasterHistory] = useState<string[]>([]);

  // Post-Game Review
  const [reviewReport, setReviewReport] = useState<GameReviewReport | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [coachHighlightSq, setCoachHighlightSq] = useState<Square | null>(null);
  const [coachTargetSq, setCoachTargetSq] = useState<Square | null>(null);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<'moves' | 'openings' | 'analysis'>('moves');

  // Initialize Engine & Subscribe to Evaluation
  useEffect(() => {
    engineService.setPersonality(personality);
    engineService.updateSettings(settings);

    const unsubEval = engineService.subscribeEval((ev) => {
      setEvaluation(ev);
    });

    const unsubBestMove = engineService.subscribeBestMove((bestMove) => {
      setIsEngineThinking(false);
      if (mode === 'vs_ai' && chess.turn() !== playerColor && !chess.isGameOver()) {
        makeEngineMove(bestMove);
      }
    });

    // Check if previous ongoing game was saved
    loadActiveGameState().then((savedState) => {
      if (savedState && savedState.sanHistory.length > 0) {
        try {
          chess.reset();
          for (const m of savedState.sanHistory) {
            chess.move(m);
          }
          setFen(chess.fen());
          setSanHistory([...savedState.sanHistory]);
          setCurrentMoveIndex(savedState.sanHistory.length - 1);
          setPlayerColor(savedState.playerColor);
          setBoardOrientation(savedState.playerColor);
          setMode(savedState.mode);
        } catch {
          // ignore corrupted restore
        }
      }
    });

    return () => {
      unsubEval();
      unsubBestMove();
    };
  }, []);

  // Update audio settings
  useEffect(() => {
    chessAudio.setEnabled(settings.soundEffects);
  }, [settings.soundEffects]);

  // Synchronize engine personality & settings changes
  useEffect(() => {
    engineService.setPersonality(personality);
  }, [personality]);

  useEffect(() => {
    engineService.updateSettings(settings);
  }, [settings]);

  // Request continuous evaluation on position change
  useEffect(() => {
    const currentFen = chess.fen();
    setFen(currentFen);

    // Save active state to IndexedDB
    saveActiveGameState({
      fen: currentFen,
      pgn: chess.pgn(),
      sanHistory,
      playerColor,
      mode,
      personalityId: personality.id,
      whiteTimeMs,
      blackTimeMs,
    });

    // Trigger engine eval
    if (settings.showEvalBar || settings.showGhostArrow || mode === 'analysis') {
      engineService.evaluatePosition(currentFen);
    }

    // Check Game Over
    if (chess.isGameOver()) {
      handleGameOver();
    } else if (mode === 'vs_ai' && chess.turn() !== playerColor) {
      // Trigger AI move
      setIsEngineThinking(true);
      engineService.findBestMove(currentFen);
    }
  }, [sanHistory.length, mode, playerColor]);

  // Dual Clock Timer Tick
  useEffect(() => {
    if (!isClockRunning || mode !== 'pass_and_play' || chess.isGameOver()) return;

    const timer = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTimeMs((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            setGameResult('Black wins on time!');
            setShowGameOverModal(true);
            return 0;
          }
          return prev - 1000;
        });
      } else {
        setBlackTimeMs((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            setGameResult('White wins on time!');
            setShowGameOverModal(true);
            return 0;
          }
          return prev - 1000;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isClockRunning, mode, chess.turn()]);

  // Handle Game Over
  const handleGameOver = () => {
    setIsClockRunning(false);
    chessAudio.playGameOver();

    let resultText = 'Game Over';
    let pgnResult: '1-0' | '0-1' | '1/2-1/2' | '*' = '*';

    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'White';
      resultText = `Checkmate! ${winner} is victorious!`;
      pgnResult = chess.turn() === 'w' ? '0-1' : '1-0';
      if ((winner === 'White' && playerColor === 'w') || (winner === 'Black' && playerColor === 'b')) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else if (chess.isDraw()) {
      if (chess.isStalemate()) resultText = 'Draw by Stalemate!';
      else if (chess.isThreefoldRepetition()) resultText = 'Draw by Threefold Repetition!';
      else if (chess.isInsufficientMaterial()) resultText = 'Draw by Insufficient Material!';
      else resultText = 'Draw by 50-move rule!';
      pgnResult = '1/2-1/2';
    }

    setGameResult(resultText);
    setShowGameOverModal(true);

    // Run offline post-game coach review
    const review = performGameReview(sanHistory);
    setReviewReport(review);

    // Save game to IndexedDB
    const saved: SavedGame = {
      id: 'game_' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      whiteName: mode === 'vs_ai' ? (playerColor === 'w' ? 'You' : personality.name) : 'White',
      blackName: mode === 'vs_ai' ? (playerColor === 'b' ? 'You' : personality.name) : 'Black',
      result: pgnResult,
      pgn: chess.pgn(),
      review,
      mode,
      personalityId: personality.id,
    };
    saveGameToDb(saved);
  };

  // Execute Player or Board Move
  const handlePlayerMove = useCallback(
    (move: { from: Square; to: Square; promotion?: string }): boolean => {
      try {
        const moveRes = chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q',
        });

        if (!moveRes) return false;

        const newSan = moveRes.san;
        const newHistory = [...sanHistory.slice(0, currentMoveIndex + 1), newSan];

        setSanHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        setFen(chess.fen());

        // Pass-and-play auto-rotation
        if (mode === 'pass_and_play' && autoRotatePassAndPlay) {
          setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
        }

        return true;
      } catch {
        return false;
      }
    },
    [chess, sanHistory, currentMoveIndex, mode, autoRotatePassAndPlay]
  );

  // Execute Engine Best Move
  const makeEngineMove = (uciMove: string) => {
    if (!uciMove || uciMove.length < 4) return;
    const from = uciMove.substring(0, 2) as Square;
    const to = uciMove.substring(2, 4) as Square;
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

    try {
      const moveRes = chess.move({ from, to, promotion });
      if (moveRes) {
        const newHistory = [...sanHistory, moveRes.san];
        setSanHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        setFen(chess.fen());

        if (chess.inCheck()) {
          chessAudio.playCheck();
        } else if (moveRes.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        // Check if user had a premove set
        if (premoveUci && premoveUci.length >= 4) {
          const pmFrom = premoveUci.substring(0, 2) as Square;
          const pmTo = premoveUci.substring(2, 4) as Square;
          setPremoveUci(null);
          setTimeout(() => {
            handlePlayerMove({ from: pmFrom, to: pmTo });
          }, 100);
        }
      }
    } catch {
      // Ignore
    }
  };

  // VCR Navigation & Move History Selection
  const jumpToMoveIndex = (idx: number) => {
    if (idx < -1 || idx >= sanHistory.length) return;

    // Speculative branching check
    if (!isBranching && idx < sanHistory.length - 1) {
      setMasterHistory([...sanHistory]);
      setIsBranching(true);
    }

    chess.reset();
    for (let i = 0; i <= idx; i++) {
      chess.move(sanHistory[i]);
    }

    setCurrentMoveIndex(idx);
    setFen(chess.fen());
    engineService.evaluatePosition(chess.fen());
  };

  const handleStepBackward = () => {
    if (currentMoveIndex >= 0) {
      jumpToMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleStepForward = () => {
    if (currentMoveIndex < sanHistory.length - 1) {
      jumpToMoveIndex(currentMoveIndex + 1);
    }
  };

  const handleJumpToStart = () => {
    jumpToMoveIndex(-1);
  };

  const handleJumpToEnd = () => {
    jumpToMoveIndex(sanHistory.length - 1);
  };

  // Branching Controls
  const exitBranch = () => {
    if (masterHistory.length > 0) {
      chess.reset();
      for (const m of masterHistory) {
        chess.move(m);
      }
      setSanHistory([...masterHistory]);
      setCurrentMoveIndex(masterHistory.length - 1);
      setFen(chess.fen());
    }
    setIsBranching(false);
  };

  const promoteBranch = () => {
    setIsBranching(false);
    setMasterHistory([]);
  };

  // Start New Game
  const startNewGame = (color: PieceColor = 'w') => {
    chess.reset();
    setFen(chess.fen());
    setSanHistory([]);
    setCurrentMoveIndex(-1);
    setPlayerColor(color);
    setBoardOrientation(color);
    setIsBranching(false);
    setMasterHistory([]);
    setReviewReport(null);
    setShowGameOverModal(false);
    clearActiveGameState();
    engineService.reset();

    // Reset clocks
    setWhiteTimeMs(10 * 60 * 1000);
    setBlackTimeMs(10 * 60 * 1000);
    setIsClockRunning(mode === 'pass_and_play');

    if (mode === 'vs_ai' && color === 'b') {
      setIsEngineThinking(true);
      engineService.findBestMove(chess.fen());
    }
  };

  // Load Past Game
  const handleLoadGame = (game: SavedGame) => {
    try {
      chess.loadPgn(game.pgn);
      setFen(chess.fen());
      const history = chess.history();
      setSanHistory(history);
      setCurrentMoveIndex(history.length - 1);
      if (game.review) {
        setReviewReport(game.review);
      }
      setMode(game.mode);
    } catch {
      // Ignore
    }
  };

  // Tablebase status for current board
  const currentTablebase = evaluateTablebase(fen);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-sm tracking-tighter">♞</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              DeepPocket
            </h1>
            <OfflineIndicator />
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton />

          <button
            onClick={() => setShowPersonalityModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            title="Select AI Personality"
          >
            <span>{personality.avatar}</span>
            <span className="hidden sm:inline font-mono">{personality.elo}</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Game History & Review"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Engine Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-900/40 border-b border-slate-800 text-xs">
        <button
          onClick={() => {
            setMode('vs_ai');
            setIsClockRunning(false);
          }}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'vs_ai'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          vs Stockfish
        </button>
        <button
          onClick={() => {
            setMode('pass_and_play');
            setIsClockRunning(true);
          }}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'pass_and_play'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pass & Play
        </button>
        <button
          onClick={() => {
            setMode('analysis');
            setIsClockRunning(false);
          }}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            mode === 'analysis'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Free Analysis
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-lg w-full mx-auto p-2 sm:p-4 gap-2">
        {/* Pass and Play Dual Clocks (When in Pass & Play mode) */}
        {mode === 'pass_and_play' && (
          <div className="w-full">
            <PassAndPlayBar
              whiteTimeMs={whiteTimeMs}
              blackTimeMs={blackTimeMs}
              turn={chess.turn()}
              autoRotateBoard={autoRotatePassAndPlay}
              onToggleAutoRotate={() => setAutoRotatePassAndPlay(!autoRotatePassAndPlay)}
              isClockRunning={isClockRunning}
              onToggleClock={() => setIsClockRunning(!isClockRunning)}
              onResetClock={() => {
                setWhiteTimeMs(10 * 60 * 1000);
                setBlackTimeMs(10 * 60 * 1000);
              }}
            />
          </div>
        )}

        {/* Top Player Status Banner */}
        <div className="w-full flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700">
              {boardOrientation === 'w' ? (mode === 'vs_ai' ? personality.avatar : '♟️') : '♔'}
            </span>
            <div>
              <span className="font-semibold text-slate-200">
                {boardOrientation === 'w'
                  ? mode === 'vs_ai'
                    ? `${personality.name} (${personality.elo})`
                    : 'Black'
                  : 'White'}
              </span>
              {isEngineThinking && chess.turn() !== playerColor && (
                <span className="ml-2 text-[10px] text-cyan-400 animate-pulse font-mono">
                  Thinking...
                </span>
              )}
            </div>
          </div>

          {/* Tablebase / Endgame Heuristic Banner */}
          {currentTablebase && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
              <span>TB:</span>
              <span>{currentTablebase.result?.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Chess Board & Live Evaluation Bar */}
        <div className="flex items-center justify-center w-full gap-2">
          {/* Vertical Real-Time Evaluation Bar */}
          {settings.showEvalBar && (
            <div className="h-[min(82vw,440px)] flex items-center">
              <EvaluationBar evaluation={evaluation} orientation={boardOrientation} />
            </div>
          )}

          {/* Interactive Chess Board Component */}
          <div className="flex-1 max-w-[440px] flex justify-center">
            <ChessBoard
              chess={chess}
              orientation={boardOrientation}
              onMove={handlePlayerMove}
              isEngineThinking={isEngineThinking}
              bestMoveUci={evaluation.bestMove}
              showGhostArrow={settings.showGhostArrow}
              hapticEnabled={settings.hapticFeedback}
              boardTheme={settings.boardTheme}
              premoveUci={premoveUci}
              onSetPremove={setPremoveUci}
              coachHighlightSq={coachHighlightSq}
              coachTargetSq={coachTargetSq}
              interactive={currentMoveIndex === sanHistory.length - 1}
            />
          </div>
        </div>

        {/* Bottom Player Status Banner */}
        <div className="w-full flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700">
              {boardOrientation === 'w' ? '♔' : mode === 'vs_ai' ? personality.avatar : '♟️'}
            </span>
            <span className="font-semibold text-slate-200">
              {boardOrientation === 'w'
                ? 'You (White)'
                : mode === 'vs_ai'
                ? `${personality.name} (${personality.elo})`
                : 'Black'}
            </span>
          </div>

          {/* Board Quick Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'))}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Flip Board View"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => startNewGame(playerColor)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="New Game"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Tabs Navigation (Moves / Openings / Analysis) */}
        <div className="w-full flex border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('moves')}
            className={`flex-1 py-1.5 font-semibold text-center border-b-2 transition ${
              activeTab === 'moves'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Moves & Branches
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`flex-1 py-1.5 font-semibold text-center border-b-2 transition ${
              activeTab === 'openings'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Opening Book
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-1.5 font-semibold text-center border-b-2 transition ${
              activeTab === 'analysis'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Engine Specs
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="w-full flex-1">
          {activeTab === 'moves' && (
            <NotationPane
              sanHistory={sanHistory}
              currentMoveIndex={currentMoveIndex}
              onSelectMoveIndex={jumpToMoveIndex}
              onStepBackward={handleStepBackward}
              onStepForward={handleStepForward}
              onJumpToStart={handleJumpToStart}
              onJumpToEnd={handleJumpToEnd}
              classifiedMoves={reviewReport?.classifiedMoves}
              isBranching={isBranching}
              onExitBranch={exitBranch}
              onPromoteBranch={promoteBranch}
            />
          )}

          {activeTab === 'openings' && (
            <OpeningExplorer
              sanHistory={sanHistory}
              onPlayBookMove={(uci) => {
                if (currentMoveIndex === sanHistory.length - 1) {
                  const from = uci.substring(0, 2) as Square;
                  const to = uci.substring(2, 4) as Square;
                  handlePlayerMove({ from, to });
                }
              }}
            />
          )}

          {activeTab === 'analysis' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stockfish 16+ Speed:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {(evaluation.nps / 1000).toFixed(1)} kN/s ({evaluation.nodes.toLocaleString()} nodes)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Evaluation Score:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {evaluation.scoreMate !== null
                    ? `Mate in ${evaluation.scoreMate}`
                    : `${(evaluation.scoreCp || 0) > 0 ? '+' : ''}${((evaluation.scoreCp || 0) / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Predicted Principal Variation:</span>
                <span className="font-mono text-slate-300 truncate max-w-[200px]">
                  {evaluation.bestLine.slice(0, 4).join(' ') || 'Analyzing...'}
                </span>
              </div>
              {reviewReport && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Open Coach Post-Game Review</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{gameResult}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Completed game against {mode === 'vs_ai' ? personality.name : 'opponent'}.
              </p>
            </div>

            <div className="w-full space-y-2">
              {reviewReport && (
                <button
                  onClick={() => {
                    setShowGameOverModal(false);
                    setShowReviewModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Award className="w-4 h-4" />
                  <span>Coach Game Review & Accuracy</span>
                </button>
              )}

              <button
                onClick={() => startNewGame('w')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Play Again as White
              </button>

              <button
                onClick={() => startNewGame('b')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Play Again as Black
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSettingsModal && (
        <EngineSettingsModal
          settings={settings}
          onUpdateSettings={(newSt) => setSettings((prev) => ({ ...prev, ...newSt }))}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showPersonalityModal && (
        <PersonalityModal
          currentPersonality={personality}
          onSelectPersonality={(newP) => {
            setPersonality(newP);
            startNewGame(playerColor);
          }}
          onClose={() => setShowPersonalityModal(false)}
        />
      )}

      {showHistoryModal && (
        <GameHistoryModal
          onClose={() => setShowHistoryModal(false)}
          onLoadGame={handleLoadGame}
          onOpenReview={(g) => {
            if (g.review) {
              setReviewReport(g.review);
              setShowReviewModal(true);
            }
          }}
        />
      )}

      {showReviewModal && reviewReport && (
        <CoachReviewModal
          report={reviewReport}
          whitePlayerName={mode === 'vs_ai' ? (playerColor === 'w' ? 'You' : personality.name) : 'White'}
          blackPlayerName={mode === 'vs_ai' ? (playerColor === 'b' ? 'You' : personality.name) : 'Black'}
          onClose={() => {
            setShowReviewModal(false);
            setCoachHighlightSq(null);
            setCoachTargetSq(null);
          }}
          onJumpToMove={(idx) => {
            jumpToMoveIndex(idx);
            const m = reviewReport.classifiedMoves[idx];
            if (m && m.bestEngineMove && m.bestEngineMove.length >= 4) {
              setCoachHighlightSq(m.bestEngineMove.substring(0, 2) as Square);
              setCoachTargetSq(m.bestEngineMove.substring(2, 4) as Square);
            }
          }}
        />
      )}
    </div>
  );
}
