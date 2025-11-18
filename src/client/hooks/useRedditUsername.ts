// src/client/hooks/useRedditUsername.ts
import { useState, useEffect } from 'react';

export const useRedditUsername = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/currentUser')
      .then(res => res.json())
      .then(data => setUsername(data.username))
      .catch(() => setUsername('Guest'));
  }, []);

  return username;
};
