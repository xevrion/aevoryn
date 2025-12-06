import React from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useStore();

  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-thin tracking-widest text-white">ZENFOCUS</h1>
        <p className="text-zinc-500 font-light tracking-wide text-sm">Quiet Productivity.</p>
      </div>

      <div className="w-16 h-[1px] bg-zinc-800 my-4" />

      <Button 
        onClick={login} 
        size="lg" 
        className="bg-white text-black hover:bg-zinc-200 min-w-[200px]"
      >
        Sign in with Google
      </Button>

      <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
        By continuing, you agree to enter a state of deep flow and zero distractions.
      </p>
    </div>
  );
};