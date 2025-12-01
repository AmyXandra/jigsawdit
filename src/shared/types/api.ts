export type CustomPuzzleData = {
  imageUrl: string;
  gridSize: number;
  difficulty: string;
  creatorUsername: string;
};

export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
  customPuzzle?: CustomPuzzleData | null;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};
