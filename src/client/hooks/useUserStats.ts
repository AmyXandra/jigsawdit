// src/client/hooks/useUserStats.ts
import { useState, useEffect } from 'react';

export const useUserStats = (username: string) => {
  const [stats, setStats] = useState<{ currentStreak: number } | null>(null);
  const [dailyPlayers, setDailyPlayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [streakRes, playersRes, userRes] = await Promise.all([
          fetch(`/api/userStreak/${username}`),
          fetch('/api/dailyPlayers'),
          fetch('/api/currentUser'),
        ]);
        const streak = await streakRes.json();
        const players = await playersRes.json();
        const currentUser = await userRes.json();


        setStats(streak);
        setDailyPlayers(players.count);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [username]);

  return { stats, dailyPlayers, isLoading };
};
