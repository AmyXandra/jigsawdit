import { PuzzlePiece } from '../types';

interface PieceProps {
  piece: PuzzlePiece;
  onDragStart: (pieceId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  size: number;
}

export const Piece = ({
  piece,
  onDragStart,
  onDragEnd,
  isDragging,
  size,
}: PieceProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', piece.id);
    onDragStart(piece.id);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  if (piece.isPlaced) {
    return null;
  }

  return (
    <div
      draggable={!piece.isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 border-2 border-gray-300 rounded-lg overflow-hidden hover:scale-105 hover:shadow-lg ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${piece.imageData})`,
        backgroundSize: 'cover',
      }}
    >
      <img
        src={piece.imageData}
        alt={`Puzzle piece ${piece.id}`}
        className="w-full h-full pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
};
