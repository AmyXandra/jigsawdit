import { useState } from 'react';
import { Puzzle, Trophy, Users, Flame, Play } from 'lucide-react';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUserStats } from '../hooks/useUserStats';

interface CustomPuzzleData {
  imageUrl: string;
  gridSize: number;
  difficulty: string;
  creatorUsername: string;
}

interface HomePageProps {
  username: string;
  puzzleId: string;
  onStartGame: () => void;
  customPuzzle?: CustomPuzzleData | null | undefined;
}

export const HomePage = ({ username, onStartGame, puzzleId, customPuzzle }: HomePageProps) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const {
    leaderboard,
    isLoading: leaderboardLoading,
    refreshLeaderboard,
  } = useLeaderboard(puzzleId);
  const { stats, dailyPlayers, isLoading: statsLoading } = useUserStats(username);

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Puzzle className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Jigsawdit</h1>
          </div>
          {customPuzzle ? (
            <div className="space-y-2">
              <p className="text-xl text-purple-600 font-semibold">Custom Puzzle Challenge</p>
              <p className="text-gray-600">
                Created by u/{customPuzzle?.creatorUsername} • {customPuzzle?.difficulty?.charAt(0).toUpperCase() + customPuzzle?.difficulty?.slice(1)} • {customPuzzle?.gridSize}x{customPuzzle?.gridSize}
              </p>
            </div>
          ) : (
            <p className="text-xl text-gray-600">Challenge yourself with daily puzzles</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 text-center border-2 border-orange-200">
              <Flame className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-4xl font-bold text-orange-600">
                {statsLoading ? '...' : stats?.currentStreak || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center border-2 border-blue-200">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Played Today</p>
              <p className="text-4xl font-bold text-blue-600">
                {statsLoading ? '...' : dailyPlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dailyPlayers === 1 ? 'player' : 'players'}
              </p>
            </div>
          </div>

          <button
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-2xl py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <Play className="w-8 h-8" fill="currentColor" />
            Start Game
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Top Players</h2>
            </div>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 hover:underline"
            >
              View All
            </button>
          </div>

          {leaderboardLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : topThree.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scores yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {topThree.map((entry:any, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const isCurrentUser = entry.username === username;

                return (
                  <div
                    key={`${entry.username}-${entry.completedAt}`}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentUser ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                    }`}
                  >
                    {/* <span
                        className={`font-semibold text-lg ${
                          isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                        }`}
                      >
                        {entry.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs">(You)</span>
                        )}
                      </span> */}
                    <div className="flex items-center sm:gap-4 gap-2">
                      <span className="text-3xl">{medal}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-lg truncate block ${
                              isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                            }`}
                          >
                            {entry.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs whitespace-nowrap">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-lg font-semibold text-gray-700">
                      {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Welcome back, <span className="font-semibold">{username}</span>!
        </p>
      </div>

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        isLoading={leaderboardLoading}
        onRefresh={refreshLeaderboard}
        currentUser={username}
      />
    </div>
  );
};
