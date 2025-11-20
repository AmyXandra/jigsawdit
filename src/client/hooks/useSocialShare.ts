// src/client/hooks/useSocialShare.ts
import { useState, useEffect } from 'react';

export const useSocialShare = () => {
  // Post comment about game completion
  const submitCompletionComment = async (comment: string) => {
    try {
      await fetch('/api/submitCompletionComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
    } catch (error) {
      console.error('Submit score error:', error);
    }
  };

  return {
    submitCompletionComment,
  };
};
