import { useState, useEffect } from 'react';
import { PuzzleCanvas } from '../components/PuzzleCanvas';
import { PieceTray } from '../components/PieceTray';
import { Timer } from '../components/Timer';
import { ReferenceImage } from '../components/ReferenceImage';
import { Leaderboard } from '../components/Leaderboard';
import { CompletionModal } from '../components/CompletionModal';
import { ProgressBar } from '../components/ProgressBar';
import { GameSettings } from '../components/GameSettings';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { usePuzzleState } from '../hooks/usePuzzleState';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Puzzle } from 'lucide-react';
import { ArrowLeft, Trophy } from 'lucide-react';

interface GameProps {
  username: string;
  puzzleId: string;
  onBackToHome: () => void;
}

const DEFAULT_IMAGE = '/puzzle-001.jpeg';

export const Game = ({ username, puzzleId, onBackToHome }: GameProps) => {
  // ────── React state (unchanged) ──────
  const [gridSize, setGridSize] = useState(4);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const { gameState, isLoading, error, startTimer, placePiece, getProgress, resetPuzzle } =
    usePuzzleState(imageUrl, gridSize);

  const {
    leaderboard,
    isLoading: leaderboardLoading,
    submitScore,
    refreshLeaderboard,
  } = useLeaderboard(puzzleId);

  const progress = getProgress();

  // ────── Completion → submit ──────
  useEffect(() => {
    if (gameState.isComplete && !showCompletionModal) {
      setShowCompletionModal(true);
      submitScore(username, gameState.elapsedTime);
      setScoreSubmitted(true);
    }
  }, [gameState.isComplete, showCompletionModal, username, submitScore]);
  

  // ────── Milestone logging ──────
  useEffect(() => {
    if (progress > previousProgress && progress > 0 && [25, 50, 75].includes(progress)) {
      console.log(`Milestone: ${progress}%`);
      setPreviousProgress(progress);
    }
  }, [progress, previousProgress]);

  // ────── Drag helpers (unchanged) ──────
  const handleDragStart = (pieceId: string) => {
    setDraggingPieceId(pieceId);
    if (!gameState.startTime) {
      startTimer();
    }
  };

  const handleDragEnd = () => {
    setDraggingPieceId(null);
  };

  const handlePieceDrop = (pieceId: string, position: { row: number; col: number }) => {
    placePiece(pieceId, position);
  };

  const handlePlayAgain = () => {
    setShowCompletionModal(false);
    resetPuzzle();
    setPreviousProgress(0);
  };

  const handleShare = () => {
    const grid = Array.from({ length: gridSize }, (_, row) =>
      Array.from({ length: gridSize }, (_, col) => {
        const piece = gameState.pieces.find(
          (p) => p.currentPosition?.row === row && p.currentPosition?.col === col
        );
        return piece ? '🟩' : '⬜';
      }).join('')
    ).join('\n');

    const shareText = `🧩 Jigsawdit\n${grid}\n in ${Math.floor(gameState.elapsedTime / 60)}:${(gameState.elapsedTime % 60).toString().padStart(2, '0')}!`;
    onBackToHome()
    // navigator.clipboard.writeText(shareText).then(() => {
    //   alert('Result copied to clipboard!');
    // });
  };

  const handleGridSizeChange = (size: number) => {
    if (gameState.pieces.some((p) => p.isPlaced)) {
      const confirmed = window.confirm('Changing grid size will reset your progress. Continue?');
      if (!confirmed) return;
    }
    setGridSize(size);
    setPreviousProgress(0);
  };

  const pieceSize = 60;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Puzzle className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800">Jigsawdit</h1>
          <p className="text-gray-600">Solve the puzzle as fast as you can!</p>
          <p className="text-xl font-semibold text-gray-700">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Leaderboard</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Timer
              elapsedTime={gameState.elapsedTime}
              isRunning={!!gameState.startTime && !gameState.isComplete}
              progress={progress}
            />
            <ReferenceImage imageUrl={imageUrl} />
            <GameSettings
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              disabled={gameState.pieces.some((p) => p.isPlaced)}
            />
          </div>

          <div className="flex justify-center">
            <PuzzleCanvas
              pieces={gameState.pieces}
              gridSize={gridSize}
              onPieceDrop={handlePieceDrop}
              draggingPieceId={draggingPieceId}
            />
          </div>

          <PieceTray
            pieces={gameState.pieces}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggingPieceId={draggingPieceId}
            pieceSize={pieceSize}
          />
        </div>
      </div>

      {showCompletionModal && (
        <CompletionModal
          elapsedTime={gameState.elapsedTime}
          onPlayAgain={handlePlayAgain}
          onShare={handleShare}
          onClose={() => setShowCompletionModal(false)}
        />
      )}

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        isLoading={leaderboardLoading}
        onRefresh={refreshLeaderboard}
        currentUser={username}
      />
    </div>
  );
};
