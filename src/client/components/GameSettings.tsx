import { Settings } from 'lucide-react';
import { useState } from 'react';

interface GameSettingsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  disabled?: boolean;
}

export const GameSettings = ({
  gridSize,
  onGridSizeChange,
  disabled = false,
}: GameSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        <Settings className="w-5 h-5" />
        <span className="font-medium">Settings</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-20">
            <h4 className="font-semibold text-gray-800 mb-3">Grid Size</h4>
            <div className="space-y-2">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    onGridSizeChange(size);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    gridSize === size
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {size}x{size} ({size * size} pieces)
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
