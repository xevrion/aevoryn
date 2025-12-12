'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/Button';
import { Settings, History, LogOut } from './ui/Icons';
import { UserSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Mark as mounted after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadSettings = async (userId: string, skipLocalStorage = false) => {
    // Load from localStorage first if available (only after mount to avoid hydration issues)
    if (!skipLocalStorage && mounted && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`aev_settings_${userId}`) || localStorage.getItem('aev_settings');
      if (stored) {
        try {
          const localSettings = JSON.parse(stored);
          setSettings(localSettings);
          // Also set the generic key for quick access
          localStorage.setItem('aev_settings', stored);
        } catch {
          // Invalid JSON, continue to fetch from Supabase
        }
      }
    }

    // Always fetch from Supabase to ensure sync (but don't block if we have localStorage)
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
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

      // Always update to ensure we're in sync with Supabase
      setSettings(supabaseSettings);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`aev_settings_${userId}`, JSON.stringify(supabaseSettings));
        localStorage.setItem('aev_settings', JSON.stringify(supabaseSettings));
      }
    } else {
      // No settings in Supabase, use defaults and save to localStorage
      if (typeof window !== 'undefined') {
        const defaultsStr = JSON.stringify(DEFAULT_SETTINGS);
        localStorage.setItem(`aev_settings_${userId}`, defaultsStr);
        localStorage.setItem('aev_settings', defaultsStr);
      }
      setSettings(DEFAULT_SETTINGS);
    }
  };

  useEffect(() => {
    if (!mounted) return; // Wait for mount to avoid hydration issues

    const loadUserAndSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Load from localStorage first, then sync with Supabase
        await loadSettings(user.id);
      } else {
        // Clear settings when logged out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aev_settings');
        }
        setSettings(DEFAULT_SETTINGS);
      }
    };

    loadUserAndSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadSettings(session.user.id);
      } else {
        // Clear settings when logged out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aev_settings');
        }
        setSettings(DEFAULT_SETTINGS);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, mounted]);

  // Listen for settings updates separately
  useEffect(() => {
    if (!user || !mounted) return;

    const handleSettingsUpdate = () => {
      // Reload settings from localStorage first (instant), then sync with Supabase
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`aev_settings_${user.id}`) || localStorage.getItem('aev_settings');
        if (stored) {
          try {
            const localSettings = JSON.parse(stored);
            setSettings(localSettings);
          } catch {
            // Invalid JSON, fetch from Supabase
          }
        }
      }
      // Then sync with Supabase in background
      loadSettings(user.id, false);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, [user, supabase, mounted]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getBackgroundStyle = () => {
    if (settings.backgroundType === 'IMAGE') {
      return { 
        backgroundImage: `url(${settings.backgroundValue})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      };
    }
    if (settings.backgroundType === 'GRADIENT') {
      return { background: settings.backgroundValue };
    }
    return { backgroundColor: settings.backgroundValue };
  };

  const overlayOpacity = settings.backgroundType === 'IMAGE' ? 'bg-black/60' : 'bg-transparent';

  return (
    <div 
      className="relative min-h-screen w-full transition-all duration-700 ease-in-out font-sans"
      style={getBackgroundStyle()}
    >
      <div className={`absolute inset-0 ${overlayOpacity} pointer-events-none transition-colors duration-700`} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        {user && (
          <header className="flex justify-between items-center p-6 sm:p-8 animate-fade-in">
            <div 
              className="text-lg font-light tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity text-white"
              onClick={() => router.push('/app')}
            >
              AEVORYN
            </div>
            <nav className="flex gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/history')}
                className={pathname === '/history' ? 'bg-white/10 text-white' : ''}
                title="History"
              >
                <History className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/settings')}
                className={pathname === '/settings' ? 'bg-white/10 text-white' : ''}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign Out">
                <LogOut className="w-5 h-5" />
              </Button>
            </nav>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
