// src/client/hooks/useInit.ts
import { useState, useEffect } from 'react';
import type { InitResponse } from '../../shared/types/api';

interface InitData {
  postId: string;
  count: number;
  username: string;
}

export const useInit = () => {
  const [data, setData] = useState<InitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

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
        setPostId(data.postId);
      } catch (err) {
        console.error('Failed to init counter', err);
        setError(err.message);
        setLoading(false);
      }
    };
    void init();
  }, []);

  return { data, username, postId, loading, error };
};
