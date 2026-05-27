export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  birthday: string; // ISO format: MM-DD (month-day only)
  relationship: string; // how you know this person
  notes?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

export interface BirthdayInfo {
  contact: Contact;
  daysUntil: number;
  nextBirthday: Date;
  age?: number;
}

export const RELATIONSHIP_OPTIONS = [
  'Collègue actuel',
  'Ancien collègue',
  'Client',
  'Partenaire commercial',
  'Mentor / Mentee',
  'Rencontre en conférence',
  'Réseau LinkedIn',
  'Ami professionnel',
  'Recruteur',
  'Autre',
] as const;
