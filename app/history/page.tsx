import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSessions } from '@/lib/db/sessions';
import { HistoryClient } from './HistoryClient';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const sessions = await getSessions(user.id);

  return <HistoryClient sessions={sessions} />;
}

