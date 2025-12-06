'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/app');
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app`,
      },
    });

    if (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-thin tracking-widest text-white">AEVORYN</h1>
        <p className="text-zinc-500 font-light tracking-wide text-sm">Quiet Productivity.</p>
      </div>

      <div className="w-16 h-[1px] bg-zinc-800 my-4" />

      <Button 
        onClick={handleGoogleLogin} 
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
}

