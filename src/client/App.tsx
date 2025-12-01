// src/client/App.tsx
import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { Game } from './pages/Game';
import { useInit } from './hooks/useInit';
import { useLeaderboard } from './hooks/useLeaderboard';

type Page = 'home' | 'game';

export default function App() {
  const { data, username, postId, loading, error } = useInit();
  const { updateStreak } = useLeaderboard(postId);

  console.log('data',data);
  

  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleStartGame = () => {
    setCurrentPage('game');
    updateStreak(username);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (loading && !postId) return <div className="p-8 text-center">Loading...</div>;
  if (error || !data) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  if (currentPage === 'game') {
    return <Game username={username} puzzleId={postId} onBackToHome={handleBackToHome} customPuzzle={data.customPuzzle} />;
  }
  // if (!gameStarted) {
  //   return <HomePage username={username} onStartGame={handleStartGame} />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <HomePage username={username} onStartGame={handleStartGame} puzzleId={postId} customPuzzle={data.customPuzzle} />
    </div>
  );
}
