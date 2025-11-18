import { useState, useEffect } from 'react';

export const useLeaderboard = (puzzleId: string) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leaderboard/${puzzleId}`);
      const { leaderboard: data } = await res.json();
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitScore = async (username: string, time: number) => {
    try {
      await fetch('/api/submitScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId, username, time }),
      });
      // Poll will refresh automatically
    } catch (error) {
      console.error('Submit score error:', error);
    }
  };

  // Update streak & daily players
  const updateStreak = async (username: string) => {
    try {
      await fetch('/api/updateStreak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      // Poll will refresh automatically
    } catch (error) {
      console.error('Submit score error:', error);
    }
  };

  // Poll every 3 seconds for updates
  useEffect(() => {
    fetchLeaderboard(); // Initial load
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [puzzleId]);

  return {
    leaderboard,
    isLoading,
    submitScore,
    updateStreak,
    refreshLeaderboard: fetchLeaderboard,
  };
};
