import { X, Trophy, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { formatTime } from '../utils/snapLogic';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  currentUser?: string;
}

export const LeaderboardModal = ({
  isOpen,
  onClose,
  entries,
  isLoading,
  onRefresh,
  currentUser,
}: LeaderboardModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No scores yet. Be the first to complete the puzzle!
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const isCurrentUser = entry.username === currentUser;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

              return (
                <div
                  key={entry.username}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-blue-50 border-2 border-blue-300 scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-600 w-12 text-center">
                      {medal || `${index + 1}`}
                    </span>
                    <div>
                      <span
                        className={`font-semibold text-lg ${
                          isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                        }`}
                      >
                        {entry.username}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-xl font-semibold text-gray-700">
                    {formatTime(entry.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
