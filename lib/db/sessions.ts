import { createClient } from '@/lib/supabase/server';
import { Session } from '@/types';

export async function getSessions(userId: string): Promise<Session[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data.map((session) => ({
    id: session.id,
    userId: session.user_id,
    date: session.date,
    startTime: session.start_time,
    endTime: session.end_time,
    focusMinutes: session.focus_minutes,
    breakMinutes: session.break_minutes,
    note: session.note || undefined,
  }));
}

export async function createSession(session: {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  focusMinutes: number;
  breakMinutes: number;
  note?: string;
}): Promise<Session | null> {
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
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    focusMinutes: data.focus_minutes,
    breakMinutes: data.break_minutes,
    note: data.note || undefined,
  } as Session;
}

