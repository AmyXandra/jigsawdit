export interface PuzzlePiece {
  id: string;
  imageData: string;
  correctPosition: { row: number; col: number };
  currentPosition: { row: number; col: number } | null;
  isPlaced: boolean;
}

export interface GameState {
  pieces: PuzzlePiece[];
  gridSize: number;
  isComplete: boolean;
  startTime: number | null;
  elapsedTime: number;
  imageUrl: string;
}

export interface LeaderboardEntry {
  username: string;
  time: number;
  completedAt: string;
}

export interface DragItem {
  pieceId: string;
  type: string;
}

export type LeaderboardEntry = {
  username: string;
  time: number;          // seconds (or ms – keep the same unit you used before)
  completedAt: string;   // ISO timestamp
};
