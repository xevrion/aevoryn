import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in text-center px-4 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl font-thin tracking-widest text-white">AEVORYN</h1>
        <p className="text-zinc-500 font-light tracking-wide text-sm mt-2">Quiet Productivity.</p>
      </div>

      <div className="w-16 h-[1px] bg-zinc-800 my-4" />

      <Link href="/login">
        <Button size="lg" className="bg-white text-black hover:bg-zinc-200 min-w-[200px]">
          Start Focus
        </Button>
      </Link>

      <p className="text-xs text-zinc-600 max-w-xs leading-relaxed mt-4">
        A radically minimal Pomodoro experience optimized for deep work and zero distractions.
      </p>
    </div>
  );
}

