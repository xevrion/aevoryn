'use server';

import { createClient } from '@/lib/supabase/server';

export async function createSessionAction(session: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  focusMinutes: number;
  breakMinutes: number;
  note?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: session.userId,
      date: session.date,
      start_time: session.startTime,
      end_time: session.endTime,
      focus_minutes: session.focusMinutes,
      break_minutes: session.breakMinutes,
      note: session.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return { error };
  }

  return { data };
}

