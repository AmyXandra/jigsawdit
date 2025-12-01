import { useState } from 'react';

interface CreatePuzzlePostParams {
  imageUrl: string;
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CreatePuzzlePostResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export const useCreatePuzzlePost = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPuzzlePost = async (
    params: CreatePuzzlePostParams
  ): Promise<CreatePuzzlePostResponse> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/createCustomPuzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create puzzle post');
      }

      const data = await response.json();
      setIsCreating(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create puzzle post';
      setError(errorMessage);
      setIsCreating(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    createPuzzlePost,
    isCreating,
    error,
  };
};
