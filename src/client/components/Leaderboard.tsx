import { Trophy, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { formatTime } from '../utils/snapLogic';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  currentUser?: string;
}

export const Leaderboard = ({
  entries,
  isLoading,
  onRefresh,
  currentUser,
}: LeaderboardProps) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Leaderboard</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No scores yet. Be the first to complete the puzzle!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.username === currentUser;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return (
              <div
                key={`${entry.username}-${entry.completedAt}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrentUser
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-600 w-8">
                    {medal || `${index + 1}.`}
                  </span>
                  <span className={`font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                    {entry.username}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </span>
                </div>
                <span className="font-mono font-semibold text-gray-700">
                  {formatTime(entry.time)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
