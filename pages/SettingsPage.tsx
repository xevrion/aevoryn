import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { SOLID_COLORS, GRADIENTS } from '../constants';
import { Button } from '../components/ui/Button';
import { Upload, X } from '../components/ui/Icons';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ backgroundType: 'IMAGE', backgroundValue: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-10 animate-fade-in pb-20">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-light text-white tracking-tight">Settings</h1>
      </div>

      {/* Durations */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Durations (Minutes)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Focus</label>
            <input 
              type="number" 
              value={settings.focusDuration}
              onChange={(e) => updateSettings({ focusDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Short Break</label>
            <input 
              type="number" 
              value={settings.shortBreakDuration}
              onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Long Break</label>
            <input 
              type="number" 
              value={settings.longBreakDuration}
              onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Timer Style */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Visuals</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => updateSettings({ timerStyle: 'NUMERIC' })}
            className={`flex-1 p-4 rounded-lg border transition-all ${settings.timerStyle === 'NUMERIC' ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
          >
            <span className="text-2xl font-light">25:00</span>
            <p className="text-xs text-zinc-400 mt-2">Minimal Numeric</p>
          </button>
          <button 
            onClick={() => updateSettings({ timerStyle: 'RING' })}
            className={`flex-1 p-4 rounded-lg border transition-all ${settings.timerStyle === 'RING' ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
          >
             <div className="w-8 h-8 rounded-full border-2 border-zinc-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs text-zinc-400">Zen Ring</p>
          </button>
        </div>
      </section>

      {/* Backgrounds */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Atmosphere</h2>
        
        {/* Solid Colors */}
        <div className="flex flex-col gap-2">
           <span className="text-xs text-zinc-600 mb-1">Solid Colors</span>
           <div className="flex gap-3 flex-wrap">
            {SOLID_COLORS.map(color => (
              <button
                key={color}
                onClick={() => updateSettings({ backgroundType: 'SOLID', backgroundValue: color })}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.backgroundValue === color ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
           </div>
        </div>

        {/* Gradients */}
        <div className="flex flex-col gap-2 mt-2">
           <span className="text-xs text-zinc-600 mb-1">Gradients</span>
           <div className="flex gap-3 flex-wrap">
            {GRADIENTS.map(gradient => (
              <button
                key={gradient.name}
                onClick={() => updateSettings({ backgroundType: 'GRADIENT', backgroundValue: gradient.value })}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.backgroundValue === gradient.value ? 'border-white' : 'border-transparent'}`}
                style={{ background: gradient.value }}
                title={gradient.name}
              />
            ))}
           </div>
        </div>

        {/* Image Upload */}
        <div className="mt-4">
          <span className="text-xs text-zinc-600 mb-2 block">Custom Image</span>
          <div className="flex gap-4 items-center">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" /> Upload
            </Button>
            {settings.backgroundType === 'IMAGE' && (
              <Button onClick={() => updateSettings({ backgroundType: 'SOLID', backgroundValue: '#000000' })} variant="ghost" size="sm">
                <X className="w-4 h-4" /> Remove
              </Button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
        </div>
      </section>
    </div>
  );
};