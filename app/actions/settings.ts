'use server';

import { createClient } from '@/lib/supabase/server';
import { UserSettings } from '@/types';

export async function upsertUserSettingsAction(
  userId: string,
  settings: Partial<UserSettings>
) {
  const supabase = await createClient();

  const updateData: any = {};
  if (settings.focusDuration !== undefined) updateData.focus_duration = settings.focusDuration;
  if (settings.shortBreakDuration !== undefined) updateData.short_break_duration = settings.shortBreakDuration;
  if (settings.longBreakDuration !== undefined) updateData.long_break_duration = settings.longBreakDuration;
  if (settings.timerStyle !== undefined) updateData.timer_style = settings.timerStyle;
  if (settings.backgroundType !== undefined) updateData.background_type = settings.backgroundType;
  if (settings.backgroundValue !== undefined) updateData.background_value = settings.backgroundValue;

  // Check if settings exist first
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  let data, error;

  if (existing) {
    // Update existing record
    const result = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert new record with all default values if not provided
    const insertData = {
      user_id: userId,
      focus_duration: updateData.focus_duration ?? 25,
      short_break_duration: updateData.short_break_duration ?? 5,
      long_break_duration: updateData.long_break_duration ?? 15,
      timer_style: updateData.timer_style ?? 'RING',
      background_type: updateData.background_type ?? 'GRADIENT',
      background_value: updateData.background_value ?? 'linear-gradient(to bottom right, #18181b, #27272a)',
      ...updateData,
    };
    
    const result = await supabase
      .from('user_settings')
      .insert(insertData)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Error upserting user settings:', error);
    return { error };
  }

  return { data };
}

