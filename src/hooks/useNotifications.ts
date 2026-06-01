import { useState, useEffect, useCallback, useRef } from 'react';
import type { BirthdayInfo } from '../types/contact';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output.buffer as ArrayBuffer;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getStorageKey(contactId: string, daysUntil: number): string {
  return `linkup_notif_${getTodayKey()}_${contactId}_d${daysUntil}`;
}

function hasBeenNotified(contactId: string, daysUntil: number): boolean {
  return localStorage.getItem(getStorageKey(contactId, daysUntil)) === '1';
}

function markNotified(contactId: string, daysUntil: number): void {
  localStorage.setItem(getStorageKey(contactId, daysUntil), '1');
}

async function savePushSubscription(userId: string): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  await supabase.from('push_subscriptions').upsert(
    { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
    { onConflict: 'user_id,endpoint' },
  );
}

export function useNotifications(upcomingBirthdays: BirthdayInfo[], userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );
  const swRef = useRef(false);

  // Register service worker once
  useEffect(() => {
    if (!('serviceWorker' in navigator) || swRef.current) return;
    swRef.current = true;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  // Save push subscription when permission is already granted (e.g. returning user)
  useEffect(() => {
    if (permission === 'granted' && userId) {
      savePushSubscription(userId).catch(() => {});
    }
  }, [permission, userId]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted' && userId) {
      await savePushSubscription(userId).catch(() => {});
    }
  }, [userId]);

  // In-app fallback: show browser notification while tab is open
  const alerts = upcomingBirthdays.filter(b => b.daysUntil === 0 || b.daysUntil === 1);

  useEffect(() => {
    if (permission !== 'granted' || alerts.length === 0) return;
    for (const { contact, daysUntil } of alerts) {
      if (hasBeenNotified(contact.id, daysUntil)) continue;
      const name = `${contact.firstName} ${contact.lastName}`;
      const title =
        daysUntil === 0
          ? `🎉 Aujourd'hui c'est l'anniversaire de ${name} !`
          : `🎂 Demain c'est l'anniversaire de ${name} !`;
      const body =
        daysUntil === 0
          ? 'Pensez à lui envoyer un message de félicitations !'
          : 'Préparez-vous à le féliciter demain !';
      new Notification(title, { body, icon: '/icon-192.png', tag: `birthday_${contact.id}_${daysUntil}` });
      markNotified(contact.id, daysUntil);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission, upcomingBirthdays]);

  return { permission, requestPermission, alerts };
}
