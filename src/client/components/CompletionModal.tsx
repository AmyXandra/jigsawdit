import { Trophy, RotateCcw, Share2 } from 'lucide-react';
import { formatTime } from '../utils/snapLogic';

interface CompletionModalProps {
  elapsedTime: number;
  onPlayAgain: () => void;
  onShare: () => void;
  onClose: () => void;
}

export const CompletionModal = ({
  elapsedTime,
  onPlayAgain,
  onShare,
  onClose,
}: CompletionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-pop">
        <div className="text-center">
          <div className="mb-6 animate-bounce">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Puzzle Complete!
          </h2>

          <p className="text-gray-600 mb-6">Congratulations on solving the puzzle!</p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Time</p>
            <p className="text-4xl font-bold text-gray-800 font-mono">
              {formatTime(elapsedTime)}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onPlayAgain}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>

            <button
              onClick={onShare}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Result
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
