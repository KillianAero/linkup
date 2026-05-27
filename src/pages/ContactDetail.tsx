import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, Edit3, Mail, Phone,
  StickyNote, ExternalLink, Cake, MessageCircle, Copy, Check
} from 'lucide-react';
import { useState } from 'react';
import type { Contact } from '../types/contact';
import { getDaysUntilBirthday, getNextBirthdayDate } from '../hooks/useContacts';

interface ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
  onBack: () => void;
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-pink-500', 'bg-rose-500', 'bg-amber-500',
];

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(contact: Contact): string {
  return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors text-gray-400 hover:text-violet-600">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function birthdayMessage(contact: Contact): string {
  return `Bonjour ${contact.firstName} ! Je pensais à toi aujourd'hui et je voulais te souhaiter un joyeux anniversaire 🎂 J'espère que tu passes une excellente journée !`;
}

export function ContactDetail({ contact, onEdit, onBack }: ContactDetailProps) {
  const daysUntil = getDaysUntilBirthday(contact.birthday);
  const nextBirthday = getNextBirthdayDate(contact.birthday);
  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 7 && !isToday;
  const [msgCopied, setMsgCopied] = useState(false);

  const [month, day] = contact.birthday.split('-').map(Number);
  const birthdayFormatted = format(new Date(2000, month - 1, day), 'd MMMM', { locale: fr });

  function handleCopyMessage() {
    navigator.clipboard.writeText(birthdayMessage(contact));
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#f5f3ff] px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white shadow-sm border border-violet-100 flex items-center justify-center text-gray-600 hover:bg-violet-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 bg-violet-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-violet-700 transition-colors active:scale-95"
        >
          <Edit3 size={15} />
          Modifier
        </button>
      </div>

      <div className="px-4 pb-8">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6 mt-2">
          <div className={`w-20 h-20 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3`}>
            {getInitials(contact)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {contact.firstName} {contact.lastName}
          </h1>
          {(contact.jobTitle || contact.company) && (
            <p className="text-gray-500 text-sm mt-1 text-center">
              {[contact.jobTitle, contact.company].filter(Boolean).join(' · ')}
            </p>
          )}
          <span className="mt-2 px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
            {contact.relationship}
          </span>
        </div>

        {/* Birthday highlight */}
        <div className={`rounded-2xl p-4 mb-4 ${
          isToday
            ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
            : isSoon
            ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
            : 'bg-white border border-violet-50 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isToday || isSoon ? 'bg-white/20' : 'bg-violet-100'
            }`}>
              <Cake size={20} className={isToday || isSoon ? 'text-white' : 'text-violet-500'} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${isToday || isSoon ? 'text-white/70' : 'text-gray-400'}`}>
                Anniversaire
              </p>
              <p className={`font-semibold ${isToday || isSoon ? 'text-white' : 'text-gray-900'}`}>
                {birthdayFormatted}
              </p>
            </div>
            <div className="text-right">
              {isToday ? (
                <span className="text-white font-bold text-lg">🎉 Aujourd'hui !</span>
              ) : (
                <div>
                  <p className={`text-xs ${isToday || isSoon ? 'text-white/70' : 'text-gray-400'}`}>Prochain</p>
                  <p className={`font-semibold ${isToday || isSoon ? 'text-white' : 'text-gray-700'}`}>
                    {format(nextBirthday, 'd MMM', { locale: fr })}
                  </p>
                  <p className={`text-xs ${isSoon ? 'text-white/80 font-semibold' : 'text-gray-400'}`}>
                    dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Birthday message CTA */}
          {(isToday || isSoon) && (
            <div className={`mt-3 pt-3 border-t ${isToday || isSoon ? 'border-white/20' : 'border-violet-100'}`}>
              <p className={`text-xs mb-2 ${isToday || isSoon ? 'text-white/80' : 'text-gray-500'}`}>
                Message suggéré :
              </p>
              <p className={`text-sm italic mb-3 leading-relaxed ${isToday || isSoon ? 'text-white/90' : 'text-gray-700'}`}>
                "{birthdayMessage(contact)}"
              </p>
              <button
                onClick={handleCopyMessage}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isToday || isSoon
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                }`}
              >
                {msgCopied ? <Check size={15} /> : <MessageCircle size={15} />}
                {msgCopied ? 'Copié !' : 'Copier le message'}
              </button>
            </div>
          )}
        </div>

        {/* Contact info */}
        {(contact.email || contact.phone || contact.linkedinUrl) && (
          <div className="bg-white rounded-2xl shadow-sm border border-violet-50 overflow-hidden mb-4">
            {contact.email && (
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
                <Mail size={16} className="text-violet-400 shrink-0" />
                <a href={`mailto:${contact.email}`} className="flex-1 text-sm text-gray-700 hover:text-violet-600 transition-colors truncate">
                  {contact.email}
                </a>
                <CopyButton text={contact.email} />
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
                <Phone size={16} className="text-violet-400 shrink-0" />
                <a href={`tel:${contact.phone}`} className="flex-1 text-sm text-gray-700 hover:text-violet-600 transition-colors">
                  {contact.phone}
                </a>
                <CopyButton text={contact.phone} />
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <ExternalLink size={16} className="text-violet-400 shrink-0" />
                <a
                  href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-sm text-violet-600 hover:underline truncate"
                >
                  Voir le profil LinkedIn
                </a>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="bg-white rounded-2xl shadow-sm border border-violet-50 px-4 py-3.5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote size={14} className="text-violet-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}

        {/* Meta */}
        <div className="text-center text-xs text-gray-300 mt-4">
          Ajouté le {format(new Date(contact.createdAt), 'd MMMM yyyy', { locale: fr })}
        </div>
      </div>
    </div>
  );
}
