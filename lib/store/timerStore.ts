import { create } from 'zustand';
import { TimerStatus, TimerType } from '@/types';

interface TimerState {
  timerStatus: TimerStatus;
  timerType: TimerType;
  timeLeft: number;
  startTime: number | null;
  setTimerStatus: (status: TimerStatus) => void;
  setTimerType: (type: TimerType) => void;
  setTimeLeft: (time: number) => void;
  setStartTime: (time: number | null) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  timerStatus: 'IDLE',
  timerType: TimerType.FOCUS,
  timeLeft: 25 * 60,
  startTime: null,
  setTimerStatus: (status) => set({ timerStatus: status }),
  setTimerType: (type) => set({ timerType: type }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setStartTime: (time) => set({ startTime: time }),
  reset: () => set({
    timerStatus: 'IDLE',
    startTime: null,
  }),
}));

