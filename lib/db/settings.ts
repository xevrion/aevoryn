import { createClient } from '@/lib/supabase/server';
import { UserSettings } from '@/types';

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return null to create defaults
      return null;
    }
    console.error('Error fetching user settings:', error);
    return null;
  }

  return {
    focusDuration: data.focus_duration,
    shortBreakDuration: data.short_break_duration,
    longBreakDuration: data.long_break_duration,
    timerStyle: data.timer_style as 'NUMERIC' | 'RING',
    backgroundType: data.background_type as 'SOLID' | 'GRADIENT' | 'IMAGE',
    backgroundValue: data.background_value,
  };
}

export async function upsertUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings | null> {
  const supabase = await createClient();

  const updateData: any = {};
  if (settings.focusDuration !== undefined) updateData.focus_duration = settings.focusDuration;
  if (settings.shortBreakDuration !== undefined) updateData.short_break_duration = settings.shortBreakDuration;
  if (settings.longBreakDuration !== undefined) updateData.long_break_duration = settings.longBreakDuration;
  if (settings.timerStyle !== undefined) updateData.timer_style = settings.timerStyle;
  if (settings.backgroundType !== undefined) updateData.background_type = settings.backgroundType;
  if (settings.backgroundValue !== undefined) updateData.background_value = settings.backgroundValue;

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...updateData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user settings:', error);
    return null;
  }

  if (!data) return null;

  return {
    focusDuration: data.focus_duration,
    shortBreakDuration: data.short_break_duration,
    longBreakDuration: data.long_break_duration,
    timerStyle: data.timer_style as 'NUMERIC' | 'RING',
    backgroundType: data.background_type as 'SOLID' | 'GRADIENT' | 'IMAGE',
    backgroundValue: data.background_value,
  };
}

