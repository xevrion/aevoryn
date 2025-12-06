'use client';

import { useTimerStore } from '@/lib/store/timerStore';
import { TimerType, UserSettings } from '@/types';

interface TimerDisplayProps {
  settings: UserSettings;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ settings }) => {
  const { timeLeft, timerType } = useTimerStore();

  const totalTime = timerType === TimerType.FOCUS 
    ? settings.focusDuration * 60 
    : timerType === TimerType.SHORT_BREAK 
    ? settings.shortBreakDuration * 60 
    : settings.longBreakDuration * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (settings.timerStyle === 'RING') {
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-[350px] h-[350px] animate-fade-in">
        {/* Background Ring */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="175"
            cy="175"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-zinc-800"
          />
          {/* Progress Ring */}
          <circle
            cx="175"
            cy="175"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-zinc-200 transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-6xl sm:text-7xl font-light tracking-tighter text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>
    );
  }

  // Numeric Only
  return (
    <div className="flex items-center justify-center py-20 animate-fade-in">
      <div className="text-8xl sm:text-9xl font-extralight tracking-tight text-white tabular-nums">
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};
