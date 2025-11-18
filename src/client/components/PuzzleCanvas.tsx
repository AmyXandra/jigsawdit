import { useRef, useState } from 'react';
import { PuzzlePiece } from '../types';
import { getDropZonePosition } from '../utils/snapLogic';

interface PuzzleCanvasProps {
  pieces: PuzzlePiece[];
  gridSize: number;
  onPieceDrop: (pieceId: string, position: { row: number; col: number }) => void;
  draggingPieceId: string | null;
}

export const PuzzleCanvas = ({
  pieces,
  gridSize,
  onPieceDrop,
  draggingPieceId,
}: PuzzleCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverPosition, setDragOverPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = getDropZonePosition(e.clientX, e.clientY, rect, gridSize);
      setDragOverPosition(position);
    }
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text/plain');

    if (canvasRef.current && pieceId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = getDropZonePosition(e.clientX, e.clientY, rect, gridSize);

      if (position) {
        onPieceDrop(pieceId, position);
      }
    }

    setDragOverPosition(null);
  };

  const placedPieces = pieces.filter((p) => p.isPlaced);

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full aspect-square bg-gray-100 rounded-lg shadow-inner border-4 border-gray-300"
      style={{
        maxWidth: '600px',
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const placedPiece = placedPieces.find(
          (p) => p.currentPosition?.row === row && p.currentPosition?.col === col
        );
        const isHighlighted =
          dragOverPosition?.row === row && dragOverPosition?.col === col;

        return (
          <div
            key={`slot-${row}-${col}`}
            className={`border border-dashed border-gray-400 transition-all duration-200 ${
              isHighlighted ? 'bg-blue-200 scale-95' : 'bg-transparent'
            } ${placedPiece ? 'border-transparent' : ''}`}
          >
            {placedPiece && (
              <div className="w-full h-full animate-pop">
                <img
                  src={placedPiece.imageData}
                  alt={`Placed piece ${placedPiece.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
