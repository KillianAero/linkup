import { useState, useEffect, useCallback } from 'react';
import type { Contact, ContactFormData, BirthdayInfo } from '../types/contact';
import { supabase } from '../lib/supabase';

export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const [month, day] = birthday.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < todayMidnight) {
    next.setFullYear(today.getFullYear() + 1);
  }
  const diffMs = next.getTime() - todayMidnight.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getNextBirthdayDate(birthday: string): Date {
  const today = new Date();
  const [month, day] = birthday.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < todayMidnight) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return next;
}

function toContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    company: row.company as string | undefined,
    jobTitle: row.job_title as string | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    birthday: row.birthday as string,
    relationship: row.relationship as string,
    notes: row.notes as string | undefined,
    linkedinUrl: row.linkedin_url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(data: ContactFormData, userId: string) {
  return {
    user_id: userId,
    first_name: data.firstName,
    last_name: data.lastName,
    company: data.company || null,
    job_title: data.jobTitle || null,
    email: data.email || null,
    phone: data.phone || null,
    birthday: data.birthday,
    relationship: data.relationship,
    notes: data.notes || null,
    linkedin_url: data.linkedinUrl || null,
  };
}

export function useContacts(userId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setContacts([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('contacts')
      .select('*')
      .order('last_name', { ascending: true })
      .then(({ data }) => {
        setContacts((data ?? []).map(toContact));
        setLoading(false);
      });
  }, [userId]);

  const addContact = useCallback(async (data: ContactFormData): Promise<Contact> => {
    if (!userId) throw new Error('Not authenticated');
    const { data: row, error } = await supabase
      .from('contacts')
      .insert(toRow(data, userId))
      .select()
      .single();
    if (error) throw error;
    const contact = toContact(row);
    setContacts(prev => [...prev, contact].sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr')));
    return contact;
  }, [userId]);

  const updateContact = useCallback(async (id: string, data: ContactFormData) => {
    const { data: row, error } = await supabase
      .from('contacts')
      .update({ ...toRow(data, userId!), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const contact = toContact(row);
    setContacts(prev => prev.map(c => c.id === id ? contact : c));
  }, [userId]);

  const deleteContact = useCallback(async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const getContact = useCallback(
    (id: string) => contacts.find(c => c.id === id),
    [contacts]
  );

  const getUpcomingBirthdays = useCallback(
    (days = 30): BirthdayInfo[] =>
      contacts
        .map(contact => ({
          contact,
          daysUntil: getDaysUntilBirthday(contact.birthday),
          nextBirthday: getNextBirthdayDate(contact.birthday),
        }))
        .filter(b => b.daysUntil <= days)
        .sort((a, b) => a.daysUntil - b.daysUntil),
    [contacts]
  );

  return { contacts, loading, addContact, updateContact, deleteContact, getContact, getUpcomingBirthdays };
}
