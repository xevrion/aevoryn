'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/ui/Button';
import { Play, Pause, Square, Check } from '@/components/ui/Icons';
import { TimerType, TimerStatus, UserSettings } from '@/types';
import { useTimerStore } from '@/lib/store/timerStore';
import { DEFAULT_SETTINGS } from '@/constants';
import { createSessionAction } from '@/app/actions/sessions';

export default function TimerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const {
    timerStatus,
    timerType,
    timeLeft,
    startTime,
    setTimerStatus,
    setTimerType,
    setTimeLeft,
    setStartTime,
    reset,
  } = useTimerStore();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Load settings from localStorage first (after mount)
      let userSettings: UserSettings = DEFAULT_SETTINGS;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`aev_settings_${user.id}`) || localStorage.getItem('aev_settings');
        if (stored) {
          try {
            userSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            setSettings(userSettings);
            // Reset timer with correct duration
            const duration = timerType === TimerType.FOCUS 
              ? userSettings.focusDuration 
              : timerType === TimerType.SHORT_BREAK 
              ? userSettings.shortBreakDuration 
              : userSettings.longBreakDuration;
            setTimeLeft(duration * 60);
          } catch {
            // Invalid JSON, continue to fetch from Supabase
          }
        }
      }

      // Fetch from Supabase in the background to sync
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const supabaseSettings: UserSettings = {
          focusDuration: data.focus_duration,
          shortBreakDuration: data.short_break_duration,
          longBreakDuration: data.long_break_duration,
          timerStyle: data.timer_style,
          backgroundType: data.background_type,
          backgroundValue: data.background_value,
        };
        
        // Only update if different
        const currentStr = JSON.stringify(userSettings);
        const supabaseStr = JSON.stringify(supabaseSettings);
        if (currentStr !== supabaseStr) {
          setSettings(supabaseSettings);
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`aev_settings_${user.id}`, supabaseStr);
            localStorage.setItem('aev_settings', supabaseStr);
          }
          // Reset timer with correct duration
          const duration = timerType === TimerType.FOCUS 
            ? supabaseSettings.focusDuration 
            : timerType === TimerType.SHORT_BREAK 
            ? supabaseSettings.shortBreakDuration 
            : supabaseSettings.longBreakDuration;
          setTimeLeft(duration * 60);
        }
      }
    };
    loadUser();
  }, [router, supabase, timerType, setTimeLeft]);

  useEffect(() => {
    if (timerStatus === 'RUNNING' && timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 1) {
          handleTimerComplete();
        }
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [timerStatus, timeLeft]);

  const handleTimerComplete = async () => {
    setTimerStatus('COMPLETED');
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Save session
    if (user && startTime) {
      const now = new Date();
      const focusMinutes = timerType === TimerType.FOCUS 
        ? settings.focusDuration 
        : 0;
      const breakMinutes = timerType !== TimerType.FOCUS 
        ? (timerType === TimerType.SHORT_BREAK ? settings.shortBreakDuration : settings.longBreakDuration)
        : 0;

      await createSessionAction({
        userId: user.id,
        date: now.toISOString().split('T')[0],
        startTime: new Date(startTime).toISOString(),
        endTime: now.toISOString(),
        focusMinutes,
        breakMinutes,
      });
    }

    // Play subtle completion sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    setTimerStatus('RUNNING');
  };

  const pauseTimer = () => {
    setTimerStatus('PAUSED');
  };

  const stopTimer = () => {
    reset();
    const duration = timerType === TimerType.FOCUS 
      ? settings.focusDuration 
      : timerType === TimerType.SHORT_BREAK 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const handleComplete = () => {
    stopTimer();
    // Cycle to next timer type
    if (timerType === TimerType.FOCUS) {
      setTimerType(TimerType.SHORT_BREAK);
    } else if (timerType === TimerType.SHORT_BREAK) {
      setTimerType(TimerType.FOCUS);
    } else {
      setTimerType(TimerType.FOCUS);
    }
  };

  const setTimerTypeHandler = (type: TimerType) => {
    setTimerType(type);
    reset();
    const duration = type === TimerType.FOCUS 
      ? settings.focusDuration 
      : type === TimerType.SHORT_BREAK 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl gap-12">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50">
        <button
          onClick={() => setTimerTypeHandler(TimerType.FOCUS)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            timerType === TimerType.FOCUS 
              ? 'bg-zinc-100 text-black shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => setTimerTypeHandler(TimerType.SHORT_BREAK)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            timerType === TimerType.SHORT_BREAK 
              ? 'bg-zinc-100 text-black shadow-lg' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => setTimerTypeHandler(TimerType.LONG_BREAK)}
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
      <TimerDisplay settings={settings} />

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

      {/* Status Text */}
      <div className="h-6 text-sm text-zinc-500 font-light tracking-wide uppercase">
        {timerStatus === 'RUNNING' ? 'Flow State' : timerStatus === 'PAUSED' ? 'Paused' : ''}
      </div>
    </div>
  );
}

