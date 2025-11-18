// import { PuzzlePiece as PuzzlePieceType } from '../types';
// import { Piece } from './Piece';

// interface PieceTrayProps {
//   pieces: PuzzlePieceType[];
//   onDragStart: (pieceId: string) => void;
//   onDragEnd: () => void;
//   draggingPieceId: string | null;
//   pieceSize: number;
// }

// export const PieceTray = ({
//   pieces,
//   onDragStart,
//   onDragEnd,
//   draggingPieceId,
//   pieceSize,
// }: PieceTrayProps) => {
//   const unplacedPieces = pieces.filter((piece) => !piece.isPlaced);

//   return (
//     <div className="w-full bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-lg font-semibold text-gray-800">Puzzle Pieces</h3>
//         <span className="text-sm text-gray-600">{unplacedPieces.length} remaining</span>
//       </div>
//       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
//         {unplacedPieces.map((piece) => (
//           <div className="flex-shrink-0">
//             <Piece
//               key={piece.id}
//               piece={piece}
//               onDragStart={onDragStart}
//               onDragEnd={onDragEnd}
//               isDragging={draggingPieceId === piece.id}
//               size={pieceSize}
//             />
//           </div>
//         ))}
//       </div>
//       {unplacedPieces.length === 0 && (
//         <p className="text-center text-gray-500 py-8">All pieces placed!</p>
//       )}
//     </div>
//   );
// };


import { PuzzlePiece as PuzzlePieceType } from '../types';
import { Piece } from './Piece';

interface PieceTrayProps {
  pieces: PuzzlePieceType[];
  onDragStart: (pieceId: string) => void;
  onDragEnd: () => void;
  draggingPieceId: string | null;
  pieceSize: number;
}

export const PieceTray = ({
  pieces,
  onDragStart,
  onDragEnd,
  draggingPieceId,
  pieceSize,
}: PieceTrayProps) => {
  const unplacedPieces = pieces.filter((piece) => !piece.isPlaced);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Puzzle Pieces</h3>
        <span className="text-sm text-gray-600">
          {unplacedPieces.length} remaining
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {unplacedPieces.map((piece) => (
          <div className="flex-shrink-0">
            <Piece
              key={piece.id}
              piece={piece}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingPieceId === piece.id}
              size={pieceSize}
            />
          </div>
        ))}
      </div>
      {unplacedPieces.length === 0 && (
        <p className="text-center text-gray-500 py-8">All pieces placed!</p>
      )}
    </div>
  );
};
