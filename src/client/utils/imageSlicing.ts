import { PuzzlePiece } from '../types';

export const sliceImageIntoPieces = async (
  imageUrl: string,
  gridSize: number
): Promise<PuzzlePiece[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // For local images (not base64 or data URLs), set crossOrigin
    const isDataUrl = imageUrl.startsWith('data:');
    const isLocalPath = imageUrl.startsWith('/');
    
    if (isLocalPath && !isDataUrl) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const targetSize = 600;
      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      const pieceWidth = targetSize / gridSize;
      const pieceHeight = targetSize / gridSize;
      const pieces: PuzzlePiece[] = [];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const pieceCanvas = document.createElement('canvas');
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          const pieceCtx = pieceCanvas.getContext('2d');

          if (pieceCtx) {
            pieceCtx.drawImage(
              canvas,
              col * pieceWidth,
              row * pieceHeight,
              pieceWidth,
              pieceHeight,
              0,
              0,
              pieceWidth,
              pieceHeight
            );

            pieces.push({
              id: `piece-${row}-${col}`,
              imageData: pieceCanvas.toDataURL(),
              correctPosition: { row, col },
              currentPosition: null,
              isPlaced: false,
            });
          }
        }
      }

      resolve(pieces);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

export const validateImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};
