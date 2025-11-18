// hooks/usePuzzleState.ts
import { useState, useEffect, useCallback } from 'react';
import { PuzzlePiece, GameState } from '../types';
import { sliceImageIntoPieces } from '../utils/imageSlicing';
import { shuffleArray } from '../utils/shuffleArray';
import { isWithinTolerance } from '../utils/snapLogic';

export const usePuzzleState = (imageUrl: string, gridSize: number = 4) => {
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

  // === LOAD SAVED GAME ===
  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await fetch('/api/load');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (json.found && json.data) {
          setGameState(json.data);
          console.log('Game loaded from save');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('No saved game or load failed — starting fresh', err);
      }

      // Fresh puzzle
      try {
        const pieces = await sliceImageIntoPieces(imageUrl, gridSize);
        const shuffled = shuffleArray(pieces);
        setGameState(prev => ({
          ...prev,
          pieces: shuffled,
          startTime: null,
          elapsedTime: 0,
          isComplete: false,
        }));
      } catch (err) {
        setError('Failed to load puzzle image');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [imageUrl, gridSize]);

  // === AUTO-SAVE (debounced, with try/catch) ===
  useEffect(() => {
    if (isLoading || gameState.pieces.length === 0) return;

    const timeout = setTimeout(() => {
      const saveGame = async () => {
        try {
          await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameState),
          });
          console.log('Game auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Don't block the user — just log
        }
      };

      saveGame();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [gameState, isLoading]);
  

  // === TIMER ===
  useEffect(() => {
    if (!gameState.startTime || gameState.isComplete) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime!) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.startTime, gameState.isComplete]);

  const startTimer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      startTime: prev.startTime || Date.now(),
    }));
  }, []);

  const placePiece = useCallback((pieceId: string, position: { row: number; col: number }) => {
    setGameState(prev => {
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.isPlaced) return prev;
      if (!isWithinTolerance(position, piece.correctPosition, 20)) return prev;

      const updated = prev.pieces.map(p =>
        p.id === pieceId
          ? { ...p, currentPosition: p.correctPosition, isPlaced: true }
          : p
      );

      const isComplete = updated.every(p => p.isPlaced);

      return { ...prev, pieces: updated, isComplete };
    });
  }, []);

  const getProgress = useCallback(() => {
    const placed = gameState.pieces.filter(p => p.isPlaced).length;
    return gameState.pieces.length ? (placed / gameState.pieces.length) * 100 : 0;
  }, [gameState.pieces]);

  const resetPuzzle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pieces: shuffleArray(prev.pieces.map(p => ({ ...p, currentPosition: null, isPlaced: false }))),
      isComplete: false,
      startTime: null,
      elapsedTime: 0,
    }));
  }, []);

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
