import { useState } from 'react';
import { Search, ChevronRight, Cake, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Contact } from '../types/contact';
import { getDaysUntilBirthday, getNextBirthdayDate } from '../hooks/useContacts';

interface ContactListProps {
  contacts: Contact[];
  onViewContact: (id: string) => void;
  onAddContact: () => void;
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

export function ContactList({ contacts, onViewContact, onAddContact }: ContactListProps) {
  const [query, setQuery] = useState('');

  const filtered = contacts.filter(c => {
    const q = query.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.jobTitle?.toLowerCase().includes(q) ||
      c.relationship.toLowerCase().includes(q)
    );
  });

  // Group alphabetically
  const grouped: Record<string, Contact[]> = {};
  [...filtered]
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr'))
    .forEach(c => {
      const key = c.lastName[0].toUpperCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-violet-900">
          Contacts <span className="text-base font-normal text-gray-400">({contacts.length})</span>
        </h1>
        <button
          onClick={onAddContact}
          className="flex items-center gap-1.5 bg-violet-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-violet-700 transition-colors active:scale-95"
        >
          <UserPlus size={16} />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un contact..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-white border border-violet-100 rounded-xl pl-9 pr-4 py-3 text-base outline-none text-gray-700 placeholder-gray-300 shadow-sm focus:border-violet-400 transition-colors"
        />
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-violet-50">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} className="text-violet-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1">Aucun contact</p>
          <p className="text-sm text-gray-400 mb-4">Commencez par ajouter votre premier contact</p>
          <button
            onClick={onAddContact}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Ajouter un contact
          </button>
        </div>
      )}

      {/* No results */}
      {contacts.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-violet-50">
          <p className="text-gray-500">Aucun résultat pour "{query}"</p>
        </div>
      )}

      {/* Grouped list */}
      {Object.entries(grouped).map(([letter, group]) => (
        <div key={letter} className="mb-4">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 px-1">{letter}</div>
          <div className="space-y-2">
            {group.map(contact => {
              const daysUntil = getDaysUntilBirthday(contact.birthday);
              const nextBd = getNextBirthdayDate(contact.birthday);
              const isSoon = daysUntil <= 7;
              const isToday = daysUntil === 0;

              return (
                <button
                  key={contact.id}
                  onClick={() => onViewContact(contact.id)}
                  className="w-full bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-violet-50 flex items-center gap-3 hover:shadow-md hover:border-violet-200 transition-all text-left active:scale-[0.98]"
                >
                  <div className={`w-11 h-11 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-bold shrink-0`}>
                    {getInitials(contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {contact.jobTitle && contact.company
                        ? `${contact.jobTitle} · ${contact.company}`
                        : contact.company || contact.jobTitle || contact.relationship}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(isToday || isSoon) && (
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        isToday ? 'bg-pink-100 text-pink-600' : 'bg-violet-100 text-violet-600'
                      }`}>
                        <Cake size={11} />
                        {isToday ? "Auj." : `${daysUntil}j`}
                      </span>
                    )}
                    {!isToday && !isSoon && (
                      <span className="text-xs text-gray-300">
                        {format(nextBd, 'd MMM', { locale: fr })}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
