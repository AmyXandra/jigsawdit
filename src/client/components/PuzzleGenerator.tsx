import { useState } from 'react';
import { Upload, Play, X, Share2 } from 'lucide-react';
import { useUploadImage } from '../hooks/useUploadImage';
import { useCreatePuzzlePost } from '../hooks/useCreatePuzzlePost';

interface PuzzleGeneratorProps {
  onGeneratePuzzle: (config: {
    imageUrl: string;
    difficulty: 'easy' | 'medium' | 'hard';
    gridSize: number;
  }) => void;
  onClose: () => void;
}

export const PuzzleGenerator = ({ onGeneratePuzzle, onClose }: PuzzleGeneratorProps) => {
  const { uploadImage, loading: uploadLoading, error: uploadError } = useUploadImage();
  const { createPuzzlePost, isCreating } = useCreatePuzzlePost();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gridSize, setGridSize] = useState(4);
  const [imageUrl, setImageUrl] = useState(''); // Original Reddit URL
  const [previewUrl, setPreviewUrl] = useState(''); // Base64 for preview/gameplay
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const difficultyConfig = {
    easy: { blocks: 4, label: 'Easy (4x4)' },
    medium: { blocks: 6, label: 'Medium (6x6)' },
    hard: { blocks: 8, label: 'Hard (8x8)' },
  };

  const gridSizeOptions = [4, 5, 6, 7, 8];

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
    setError('');
  };

  const handleDevvitImageUpload = async () => {
    setError('');
    const uploadedImageUrl = await uploadImage('Select your puzzle image');
    
    if (uploadedImageUrl) {
      // Store the original Reddit URL for post creation
      setImageUrl(uploadedImageUrl);
      
      // Convert the image to base64 via server for preview and gameplay (to avoid CORS)
      try {
        const response = await fetch('/api/convertImageToBase64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: uploadedImageUrl }),
        });

        if (!response.ok) {
          throw new Error('Failed to convert image');
        }

        const data = await response.json();
        
        if (data.success && data.dataUrl) {
          setPreviewUrl(data.dataUrl);
          console.log('Image converted to base64, size:', data.size, 'bytes');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Failed to convert image:', err);
        setError('Failed to convert image. Please try again.');
      }
    } else if (uploadError) {
      setError(uploadError);
    }
  };

  const handleGeneratePuzzle = async () => {
    if (!previewUrl) {
      setError('Please select or upload an image');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      onGeneratePuzzle({
        imageUrl: previewUrl,
        difficulty,
        gridSize,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!imageUrl) {
      setError('Please select or upload an image');
      return;
    }

    setError('');
    setSuccessMessage('');

    // Use the original imageUrl (Reddit CDN URL) for post creation
    // The base64 previewUrl is only for display
    const result = await createPuzzlePost({
      imageUrl: imageUrl,
      gridSize,
      difficulty,
    });

    if (result.success && result.postUrl) {
      setSuccessMessage('Puzzle post created successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to create puzzle post');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-pop">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Create Custom Puzzle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Image</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="Paste image URL (e.g., https://...)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <button
                type="button"
                onClick={handleDevvitImageUpload}
                disabled={uploadLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5 text-gray-600" />
                <div className="text-center">
                  <p className="font-medium text-gray-800">
                    {uploadLoading ? 'Uploading...' : 'Upload Image from Device'}
                  </p>
                  <p className="text-sm text-gray-500">Click to select image</p>
                </div>
              </button>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview</p>
                <img
                  src={previewUrl}
                  alt="Puzzle preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">Difficulty</label>
              <div className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      difficulty === level
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {difficultyConfig[level].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Grid Size: {gridSize}x{gridSize}
              </label>
              <div className="space-y-2">
                {gridSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      gridSize === size
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePuzzle}
                disabled={isLoading || !previewUrl}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                {isLoading ? 'Generating...' : 'Play Now'}
              </button>
            </div>
            
            <button
              onClick={handleCreatePost}
              disabled={isCreating || !previewUrl}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              {isCreating ? 'Creating Post...' : 'Share as Reddit Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
