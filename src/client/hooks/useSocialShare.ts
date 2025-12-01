// src/client/hooks/useSocialShare.ts
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

  // Post user generated game
  const userGeneratedContent = async (image: string, title: string) => {
    try {
      await fetch('/api/userGeneratedContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image, title: title }),
      });
    } catch (error) {
      console.error('Submit score error:', error);
    }
  };

  return {
    submitCompletionComment,
    userGeneratedContent,
  };
};
