import { useState, useEffect } from 'react';

export const usePostId = () => {
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/postId')
      .then(res => res.json())
      .then(data => setPostId(data.postId))
      .catch(() => setPostId('unknown'));
  }, []);

  return postId;
};
