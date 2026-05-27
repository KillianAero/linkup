import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Gift, Cake, MessageCircle, ChevronRight, Users, PartyPopper } from 'lucide-react';
import type { BirthdayInfo, Contact } from '../types/contact';

interface DashboardProps {
  upcomingBirthdays: BirthdayInfo[];
  totalContacts: number;
  onViewContact: (id: string) => void;
  onAddContact: () => void;
}

function getBirthdayBadge(daysUntil: number) {
  if (daysUntil === 0) return { label: "Aujourd'hui !", color: 'bg-pink-500 text-white', emoji: '🎉' };
  if (daysUntil === 1) return { label: 'Demain', color: 'bg-orange-400 text-white', emoji: '🎂' };
  if (daysUntil <= 7) return { label: `Dans ${daysUntil}j`, color: 'bg-violet-500 text-white', emoji: '🎁' };
  return { label: `Dans ${daysUntil}j`, color: 'bg-violet-100 text-violet-700', emoji: '📅' };
}

function getInitials(contact: Contact): string {
  return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-pink-500', 'bg-rose-500', 'bg-amber-500',
];

function getAvatarColor(id: string): string {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function Dashboard({ upcomingBirthdays, totalContacts, onViewContact, onAddContact }: DashboardProps) {
  const todayBirthdays = upcomingBirthdays.filter(b => b.daysUntil === 0);
  const soonBirthdays = upcomingBirthdays.filter(b => b.daysUntil > 0);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Welcome banner */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-violet-900 mb-1">Bonjour 👋</h1>
        <p className="text-sm text-gray-500">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Users size={16} className="text-violet-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Contacts</span>
          </div>
          <p className="text-3xl font-bold text-violet-900">{totalContacts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
              <Gift size={16} className="text-pink-500" />
            </div>
            <span className="text-xs font-medium text-gray-500">Ce mois</span>
          </div>
          <p className="text-3xl font-bold text-violet-900">{upcomingBirthdays.length}</p>
        </div>
      </div>

      {/* Today's birthdays */}
      {todayBirthdays.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <PartyPopper size={18} />
              <h2 className="font-semibold text-base">Anniversaires aujourd'hui !</h2>
            </div>
            <div className="space-y-3">
              {todayBirthdays.map(({ contact }) => (
                <button
                  key={contact.id}
                  onClick={() => onViewContact(contact.id)}
                  className="w-full flex items-center gap-3 bg-white/20 rounded-xl p-3 text-left hover:bg-white/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {getInitials(contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{contact.firstName} {contact.lastName}</p>
                    <p className="text-xs text-white/80 truncate">{contact.relationship}</p>
                  </div>
                  <MessageCircle size={18} className="shrink-0 opacity-80" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming birthdays */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-violet-900 flex items-center gap-2">
            <Cake size={18} className="text-violet-500" />
            Prochains anniversaires
          </h2>
          <span className="text-xs text-gray-400">30 jours</span>
        </div>

        {soonBirthdays.length === 0 && todayBirthdays.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-violet-50">
            {totalContacts === 0 ? (
              <>
                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-violet-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Aucun contact pour l'instant</p>
                <p className="text-sm text-gray-400 mb-4">Ajoutez vos premiers contacts pour commencer</p>
                <button
                  onClick={onAddContact}
                  className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Ajouter un contact
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift size={24} className="text-violet-400" />
                </div>
                <p className="text-gray-600 font-medium">Aucun anniversaire ce mois-ci</p>
                <p className="text-sm text-gray-400">Les prochains arriveront bientôt !</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {soonBirthdays.map(({ contact, daysUntil, nextBirthday }) => {
              const badge = getBirthdayBadge(daysUntil);
              return (
                <button
                  key={contact.id}
                  onClick={() => onViewContact(contact.id)}
                  className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-violet-50 flex items-center gap-3 hover:shadow-md hover:border-violet-200 transition-all text-left active:scale-[0.98]"
                >
                  <div className={`w-11 h-11 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-bold shrink-0`}>
                    {getInitials(contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {badge.emoji} {format(nextBirthday, 'd MMMM', { locale: fr })} · {contact.relationship}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
