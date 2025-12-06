import React from 'react';
import { useStore } from '../context/StoreContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { Button } from '../components/ui/Button';
import { Play, Pause, Square, Check, X } from '../components/ui/Icons';
import { TimerType } from '../types';

export const TimerPage: React.FC = () => {
  const { 
    timerStatus, 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    setTimerType, 
    timerType 
  } = useStore();

  const handleComplete = () => {
    stopTimer();
    // After complete, usually go to break or back to focus
    if (timerType === TimerType.FOCUS) {
      setTimerType(TimerType.SHORT_BREAK);
    } else {
      setTimerType(TimerType.FOCUS);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl gap-12">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50">
        <button
          onClick={() => setTimerType(TimerType.FOCUS)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            timerType === TimerType.FOCUS 
              ? 'bg-zinc-100 text-black shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => setTimerType(TimerType.SHORT_BREAK)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            timerType === TimerType.SHORT_BREAK 
              ? 'bg-zinc-100 text-black shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => setTimerType(TimerType.LONG_BREAK)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            timerType === TimerType.LONG_BREAK 
              ? 'bg-zinc-100 text-black shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Timer Visual */}
      <TimerDisplay />

      {/* Controls */}
      <div className="flex items-center gap-6">
        {timerStatus === 'RUNNING' ? (
          <Button 
            onClick={pauseTimer} 
            className="w-16 h-16 rounded-full !p-0 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
          >
            <Pause className="w-6 h-6 fill-current" />
          </Button>
        ) : timerStatus === 'COMPLETED' ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <p className="text-lg font-light text-zinc-300">Session Completed</p>
            <Button onClick={handleComplete} variant="outline" className="gap-2">
              Start Next Cycle <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={startTimer} 
            className="w-16 h-16 rounded-full !p-0 bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </Button>
        )}

        {(timerStatus === 'RUNNING' || timerStatus === 'PAUSED') && (
          <Button 
            onClick={stopTimer} 
            variant="ghost" 
            className="w-12 h-12 rounded-full !p-0 text-zinc-500 hover:text-red-400 hover:bg-red-900/10"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        )}
      </div>

      {/* Status Text (Optional minimal feedback) */}
      <div className="h-6 text-sm text-zinc-500 font-light tracking-wide uppercase">
        {timerStatus === 'RUNNING' ? 'Flow State' : timerStatus === 'PAUSED' ? 'Paused' : ''}
      </div>
    </div>
  );
};