import { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, User, Briefcase, Mail, Phone, Calendar, Heart, StickyNote, ExternalLink } from 'lucide-react';
import type { Contact, ContactFormData } from '../types/contact';
import { RELATIONSHIP_OPTIONS } from '../types/contact';

interface ContactFormProps {
  contact?: Contact;
  onSave: (data: ContactFormData) => void;
  onDelete?: () => void;
  onBack: () => void;
}

const EMPTY_FORM: ContactFormData = {
  firstName: '',
  lastName: '',
  company: '',
  jobTitle: '',
  email: '',
  phone: '',
  birthday: '',
  relationship: '',
  notes: '',
  linkedinUrl: '',
};

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, icon, children }: FieldProps) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-violet-50">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-violet-400">{icon}</span>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      </div>
      {children}
    </div>
  );
}

function inputClass(hasValue: boolean) {
  return `w-full text-base outline-none bg-transparent placeholder-gray-300 ${hasValue ? 'text-gray-900' : 'text-gray-400'}`;
}

export function ContactForm({ contact, onSave, onDelete, onBack }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (contact) {
      const { id, createdAt, updatedAt, ...rest } = contact;
      setForm(rest);
    }
  }, [contact]);

  function set<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!form.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!form.birthday) newErrors.birthday = 'Date d\'anniversaire requise';
    if (!form.relationship) newErrors.relationship = 'Comment vous connaissez-vous ?';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(form);
  }

  const isEdit = !!contact;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f5f3ff] px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white shadow-sm border border-violet-100 flex items-center justify-center text-gray-600 hover:bg-violet-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-violet-900 text-lg flex-1">
          {isEdit ? 'Modifier le contact' : 'Nouveau contact'}
        </h1>
        {isEdit && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="px-4 pb-6 space-y-3">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`bg-white rounded-2xl px-4 py-3 shadow-sm border ${errors.firstName ? 'border-red-300' : 'border-violet-50'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <User size={14} className="text-violet-400" />
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom *</label>
            </div>
            <input
              type="text"
              placeholder="Jean"
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              className={inputClass(!!form.firstName)}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
          </div>
          <div className={`bg-white rounded-2xl px-4 py-3 shadow-sm border ${errors.lastName ? 'border-red-300' : 'border-violet-50'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <User size={14} className="text-violet-400" />
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom *</label>
            </div>
            <input
              type="text"
              placeholder="Dupont"
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              className={inputClass(!!form.lastName)}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Birthday */}
        <div className={`bg-white rounded-2xl px-4 py-3 shadow-sm border ${errors.birthday ? 'border-red-300' : 'border-violet-50'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar size={14} className="text-violet-400" />
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'anniversaire *</label>
          </div>
          <div className="flex items-center gap-2">
            <BirthdayInput
              value={form.birthday}
              onChange={val => set('birthday', val)}
            />
          </div>
          {errors.birthday && <p className="text-xs text-red-400 mt-1">{errors.birthday}</p>}
          <p className="text-xs text-gray-400 mt-1">Mois / Jour (l'année est optionnelle)</p>
        </div>

        {/* Relationship */}
        <div className={`bg-white rounded-2xl px-4 py-3 shadow-sm border ${errors.relationship ? 'border-red-300' : 'border-violet-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-violet-400" />
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Comment vous connaissez-vous ? *</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => set('relationship', option)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.relationship === option
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {form.relationship === 'Autre' && (
            <input
              type="text"
              placeholder="Précisez..."
              className="mt-2 w-full text-sm outline-none text-gray-700 placeholder-gray-300"
            />
          )}
          {errors.relationship && <p className="text-xs text-red-400 mt-1">{errors.relationship}</p>}
        </div>

        {/* Company & Job */}
        <Field label="Entreprise" icon={<Briefcase size={14} />}>
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            value={form.company}
            onChange={e => set('company', e.target.value)}
            className={inputClass(!!form.company)}
          />
        </Field>

        <Field label="Poste" icon={<Briefcase size={14} />}>
          <input
            type="text"
            placeholder="Titre du poste"
            value={form.jobTitle}
            onChange={e => set('jobTitle', e.target.value)}
            className={inputClass(!!form.jobTitle)}
          />
        </Field>

        {/* Contact info */}
        <Field label="Email" icon={<Mail size={14} />}>
          <input
            type="email"
            placeholder="jean@exemple.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className={inputClass(!!form.email)}
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field label="Téléphone" icon={<Phone size={14} />}>
          <input
            type="tel"
            placeholder="+33 6 00 00 00 00"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            className={inputClass(!!form.phone)}
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>

        <Field label="LinkedIn" icon={<ExternalLink size={14} />}>
          <input
            type="url"
            placeholder="linkedin.com/in/..."
            value={form.linkedinUrl}
            onChange={e => set('linkedinUrl', e.target.value)}
            className={inputClass(!!form.linkedinUrl)}
            inputMode="url"
          />
        </Field>

        {/* Notes */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-violet-50">
          <div className="flex items-center gap-2 mb-1.5">
            <StickyNote size={14} className="text-violet-400" />
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
          </div>
          <textarea
            placeholder="Sujets de conversation, contexte, points communs..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className="w-full text-base outline-none bg-transparent placeholder-gray-300 text-gray-900 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-violet-600 text-white py-4 rounded-2xl font-semibold text-base shadow-md hover:bg-violet-700 active:scale-[0.98] transition-all"
        >
          {isEdit ? 'Enregistrer les modifications' : 'Ajouter le contact'}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Supprimer ce contact ?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Cette action est irréversible. {contact?.firstName} {contact?.lastName} sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Birthday picker: month/day selector
function BirthdayInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  useEffect(() => {
    if (value) {
      const [m, d] = value.split('-');
      setMonth(m || '');
      setDay(d || '');
    }
  }, [value]);

  function update(newMonth: string, newDay: string) {
    if (newMonth && newDay) {
      onChange(`${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  }

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const daysInMonth = month ? new Date(2000, parseInt(month), 0).getDate() : 31;

  return (
    <div className="flex gap-3 w-full">
      <select
        value={month}
        onChange={e => { setMonth(e.target.value); update(e.target.value, day); }}
        className="flex-1 text-base outline-none bg-transparent text-gray-700"
      >
        <option value="">Mois</option>
        {months.map((m, i) => (
          <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
        ))}
      </select>
      <select
        value={day}
        onChange={e => { setDay(e.target.value); update(month, e.target.value); }}
        className="w-20 text-base outline-none bg-transparent text-gray-700"
      >
        <option value="">Jour</option>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
        ))}
      </select>
    </div>
  );
}
