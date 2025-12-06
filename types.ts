export interface Session {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  focusMinutes: number;
  breakMinutes: number;
  note?: string;
}

export interface UserSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  timerStyle: 'NUMERIC' | 'RING';
  backgroundType: 'SOLID' | 'GRADIENT' | 'IMAGE';
  backgroundValue: string; // Hex, gradient string, or base64 data URL
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export enum TimerType {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface GeminiInsight {
  text: string;
  date: string;
}