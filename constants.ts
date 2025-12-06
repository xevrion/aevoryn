import { UserSettings } from "./types";

export const DEFAULT_SETTINGS: UserSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  timerStyle: 'RING',
  backgroundType: 'GRADIENT',
  backgroundValue: 'linear-gradient(to bottom right, #18181b, #27272a)', // Zinc 900 to 800
};

export const GRADIENTS = [
  { name: 'Midnight', value: 'linear-gradient(to bottom right, #000000, #434343)' },
  { name: 'Dusk', value: 'linear-gradient(to bottom right, #232526, #414345)' },
  { name: 'Ocean', value: 'linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)' },
  { name: 'Forest', value: 'linear-gradient(to bottom right, #134e5e, #71b280)' },
  { name: 'Ember', value: 'linear-gradient(to bottom right, #451e3e, #651e3e)' },
];

export const SOLID_COLORS = [
  '#000000',
  '#18181b', // Zinc 950
  '#27272a', // Zinc 800
  '#2e1065', // Violet 950
  '#0f172a', // Slate 950
  '#052e16', // Green 950
];