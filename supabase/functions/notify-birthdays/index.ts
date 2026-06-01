import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

webpush.setVapidDetails(
  'mailto:killian.petton@ventura-agency.fr',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayKey = fmt(today);
  const tomorrowKey = fmt(tomorrow);

  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, user_id, birthday')
    .in('birthday', [todayKey, tomorrowKey]);

  if (contactsError) {
    return new Response(JSON.stringify({ error: contactsError.message }), { status: 500 });
  }
  if (!contacts?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const byUser: Record<string, typeof contacts> = {};
  for (const c of contacts) {
    (byUser[c.user_id] ??= []).push(c);
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', Object.keys(byUser));

  let sent = 0;
  const expired: string[] = [];

  for (const sub of subs ?? []) {
    const userContacts = byUser[sub.user_id] ?? [];
    for (const contact of userContacts) {
      const daysUntil = contact.birthday === todayKey ? 0 : 1;
      const name = `${contact.first_name} ${contact.last_name}`;
      const title =
        daysUntil === 0
          ? `🎉 Aujourd'hui c'est l'anniversaire de ${name} !`
          : `🎂 Demain c'est l'anniversaire de ${name} !`;
      const body =
        daysUntil === 0
          ? 'Pensez à lui envoyer un message de félicitations !'
          : 'Préparez-vous à le féliciter demain !';

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, tag: `birthday_${contact.id}_${daysUntil}` }),
        );
        sent++;
      } catch (e) {
        // 410 Gone = subscription expired, clean it up
        if ((e as { statusCode?: number }).statusCode === 410) {
          expired.push(sub.id);
        }
      }
    }
  }

  if (expired.length) {
    await supabase.from('push_subscriptions').delete().in('id', expired);
  }

  return new Response(JSON.stringify({ sent, expired: expired.length }), { status: 200 });
});
