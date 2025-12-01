import { useState } from 'react';
import { showForm } from '@devvit/web/client';

export const useUploadImage = () => {
  const [uploadedImageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (labelText: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    console.log('about to upload');
    
    
    try {
      const result = await showForm({
        title: 'Upload an image!',
        fields: [
          {
            name: 'myImage',
            type: 'image',
            label: labelText,
            required: true,
          },
        ],
        acceptLabel: 'Upload',
        cancelLabel: 'Cancel',
      });

      if (result.action === 'SUBMITTED' && result.values.myImage) {
        console.log('Image uploaded successfully:', result.values.myImage);
        setImageUrl(result.values.myImage);
        setLoading(false);
        return result.values.myImage;
      } else {
        console.log('Upload cancelled');
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setLoading(false);
      return null;
    }
  };

  return {
    uploadedImageUrl,
    loading,
    error,
    uploadImage,
  };
};
