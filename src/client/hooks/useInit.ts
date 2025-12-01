// src/client/hooks/useInit.ts
import { useState, useEffect } from 'react';
import type { InitResponse } from '../../shared/types/api';

export const useInit = () => {
  const [data, setData] = useState<InitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InitResponse = await res.json();

        if (data.type !== 'init') throw new Error('Unexpected response');
        setData(data);
        setLoading(false);
        setPostId(data.postId);
        setUsername(data.username);
      } catch (err) {
        console.error('Failed to init counter', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
      }
    };
    void init();
  }, []);

  return { data, username, postId, loading, error };
};
