import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserSettings } from '@/lib/db/settings';
import { DEFAULT_SETTINGS } from '@/constants';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const settings = await getUserSettings(user.id) || DEFAULT_SETTINGS;

  return <SettingsClient initialSettings={settings} userId={user.id} />;
}

