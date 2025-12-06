import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserSettings, Session, TimerStatus, TimerType } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface StoreContextType {
  user: User | null;
  settings: UserSettings;
  sessions: Session[];
  timerStatus: TimerStatus;
  timerType: TimerType;
  timeLeft: number;
  login: () => void;
  logout: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  setTimerType: (type: TimerType) => void;
  addSession: (note?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('zf_user');
    return stored ? JSON.parse(stored) : null;
  });

  // --- Settings State ---
  const [settings, setSettings] = useState<UserSettings>(() => {
    const stored = localStorage.getItem('zf_settings');
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  // --- Sessions State ---
  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = localStorage.getItem('zf_sessions');
    return stored ? JSON.parse(stored) : [];
  });

  // --- Timer State ---
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('IDLE');
  const [timerType, setTimerType] = useState<TimerType>(TimerType.FOCUS);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [startTime, setStartTime] = useState<number | null>(null);

  // --- Persistence ---
  useEffect(() => {
    if (user) localStorage.setItem('zf_user', JSON.stringify(user));
    else localStorage.removeItem('zf_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('zf_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('zf_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- Actions ---
  const login = () => {
    // Mock Google Login
    const mockUser: User = {
      id: 'u1',
      email: 'user@example.com',
      name: 'Zen User',
      avatarUrl: 'https://picsum.photos/200',
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    setTimerStatus('IDLE');
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // If timer is IDLE, update current time based on new duration
      if (timerStatus === 'IDLE') {
        const duration = timerType === TimerType.FOCUS 
          ? updated.focusDuration 
          : timerType === TimerType.SHORT_BREAK 
          ? updated.shortBreakDuration 
          : updated.longBreakDuration;
        setTimeLeft(duration * 60);
      }
      return updated;
    });
  };

  const addSession = useCallback((note?: string) => {
    if (!user) return;
    
    // Only save FOCUS sessions for analytics usually, but PRD implies tracking "past sessions"
    // We'll track all completed cycles.
    const duration = timerType === TimerType.FOCUS 
      ? settings.focusDuration 
      : timerType === TimerType.SHORT_BREAK 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;

    const newSession: Session = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date().toISOString(),
      startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: duration,
      type: timerType === 'FOCUS' ? 'FOCUS' : timerType === 'SHORT_BREAK' ? 'SHORT_BREAK' : 'LONG_BREAK',
      note
    };

    setSessions(prev => [newSession, ...prev]);
  }, [user, timerType, settings, startTime]);

  // --- Timer Logic ---
  const startTimer = () => {
    setTimerStatus('RUNNING');
    if (!startTime) setStartTime(Date.now());
  };

  const pauseTimer = () => {
    setTimerStatus('PAUSED');
  };

  const stopTimer = () => {
    setTimerStatus('IDLE');
    setStartTime(null);
    // Reset time based on current type
    const duration = timerType === TimerType.FOCUS 
      ? settings.focusDuration 
      : timerType === TimerType.SHORT_BREAK 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const handleTimerComplete = useCallback(() => {
    addSession(); // Auto-save
    setTimerStatus('COMPLETED');
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Subtle bell
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
  }, [addSession]);

  useEffect(() => {
    let interval: number;

    if (timerStatus === 'RUNNING') {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerStatus, handleTimerComplete]);

  // Reset timer when type changes manually
  const setTimerTypeHandler = (type: TimerType) => {
    setTimerType(type);
    setTimerStatus('IDLE');
    setStartTime(null);
    const duration = type === TimerType.FOCUS 
      ? settings.focusDuration 
      : type === TimerType.SHORT_BREAK 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  return (
    <StoreContext.Provider value={{
      user,
      settings,
      sessions,
      timerStatus,
      timerType,
      timeLeft,
      login,
      logout,
      updateSettings,
      startTimer,
      pauseTimer,
      stopTimer,
      setTimerType: setTimerTypeHandler,
      addSession,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};