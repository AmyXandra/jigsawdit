import { useState, useEffect, useCallback } from 'react';
import { PuzzlePiece, GameState } from '../types';
import { sliceImageIntoPieces } from '../utils/imageSlicing';
import { shuffleArray } from '../utils/shuffleArray';
import { isWithinTolerance } from '../utils/snapLogic';

export const usePuzzleState = (imageUrl: string, gridSize: number) => {
  const [gameState, setGameState] = useState<GameState>({
    pieces: [],
    gridSize,
    isComplete: false,
    startTime: null,
    elapsedTime: 0,
    imageUrl,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePuzzle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pieces = await sliceImageIntoPieces(imageUrl, gridSize);
        const shuffledPieces = shuffleArray(pieces);

        setGameState({
          pieces: shuffledPieces,
          gridSize,
          isComplete: false,
          startTime: null,
          elapsedTime: 0,
          imageUrl,
        });
      } catch (err) {
        setError('Failed to load puzzle image. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializePuzzle();
  }, [imageUrl, gridSize]);

  useEffect(() => {
    if (!gameState.startTime || gameState.isComplete) return;

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime!) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.startTime, gameState.isComplete]);

  const startTimer = useCallback(() => {
    setGameState((prev) => {
      if (prev.startTime) return prev;
      return { ...prev, startTime: Date.now() };
    });
  }, []);

  const placePiece = useCallback(
    (pieceId: string, position: { row: number; col: number }) => {
      setGameState((prev) => {
        const pieceIndex = prev.pieces.findIndex((p) => p.id === pieceId);
        if (pieceIndex === -1) return prev;

        const piece = prev.pieces[pieceIndex];

        if (
          !isWithinTolerance(position, piece.correctPosition, 0) ||
          piece.isPlaced
        ) {
          return prev;
        }

        const updatedPieces = [...prev.pieces];
        updatedPieces[pieceIndex] = {
          ...piece,
          currentPosition: piece.correctPosition,
          isPlaced: true,
        };

        const allPlaced = updatedPieces.every((p) => p.isPlaced);

        return {
          ...prev,
          pieces: updatedPieces,
          isComplete: allPlaced,
        };
      });
    },
    []
  );

  const getProgress = useCallback(() => {
    const placedCount = gameState.pieces.filter((p) => p.isPlaced).length;
    const totalCount = gameState.pieces.length;
    return totalCount > 0 ? (placedCount / totalCount) * 100 : 0;
  }, [gameState.pieces]);

  const resetPuzzle = useCallback(() => {
    const shuffledPieces = shuffleArray(
      gameState.pieces.map((p) => ({
        ...p,
        currentPosition: null,
        isPlaced: false,
      }))
    );

    setGameState({
      ...gameState,
      pieces: shuffledPieces,
      isComplete: false,
      startTime: null,
      elapsedTime: 0,
    });
  }, [gameState]);

  return {
    gameState,
    isLoading,
    error,
    startTimer,
    placePiece,
    getProgress,
    resetPuzzle,
  };
};
