import { Timer as TimerIcon } from 'lucide-react';
import { formatTime } from '../utils/snapLogic';

interface TimerProps {
  elapsedTime: number;
  isRunning: boolean;
}

export const Timer = ({ elapsedTime, isRunning }: TimerProps) => {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border-2 border-gray-200">
      <TimerIcon className={`w-5 h-5 ${isRunning ? 'text-blue-600' : 'text-gray-400'}`} />
      <span className="font-mono text-xl font-semibold text-gray-800">
        {formatTime(elapsedTime)}
      </span>
    </div>
  );
};
