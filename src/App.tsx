import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ContactList } from './pages/ContactList';
import { ContactForm } from './pages/ContactForm';
import { ContactDetail } from './pages/ContactDetail';
import { Login } from './pages/Login';
import { useContacts } from './hooks/useContacts';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import type { ContactFormData } from './types/contact';
import './index.css';

type Page = 'dashboard' | 'contacts' | 'add' | 'detail' | 'edit';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { contacts, loading: contactsLoading, addContact, updateContact, deleteContact, getContact, getUpcomingBirthdays } = useContacts(user?.id ?? null);
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const upcomingBirthdays = useMemo(() => getUpcomingBirthdays(30), [getUpcomingBirthdays]);
  const { permission, requestPermission, alerts } = useNotifications(upcomingBirthdays, user?.id ?? null);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-[#f5f3ff] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onGoogleSignIn={signInWithGoogle} />;
  }

  function navigate(p: Page, id?: string) {
    setPage(p);
    if (id !== undefined) setSelectedId(id);
    window.scrollTo(0, 0);
  }

  async function handleSaveContact(data: ContactFormData) {
    if (page === 'edit' && selectedId) {
      await updateContact(selectedId, data);
      navigate('detail', selectedId);
    } else {
      const created = await addContact(data);
      navigate('detail', created.id);
    }
  }

  async function handleDeleteContact() {
    if (selectedId) {
      await deleteContact(selectedId);
      navigate('contacts');
    }
  }

  const selectedContact = selectedId ? getContact(selectedId) : undefined;

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            upcomingBirthdays={upcomingBirthdays}
            totalContacts={contacts.length}
            onViewContact={id => navigate('detail', id)}
            onAddContact={() => navigate('add')}
          />
        );
      case 'contacts':
        return (
          <ContactList
            contacts={contacts}
            onViewContact={id => navigate('detail', id)}
            onAddContact={() => navigate('add')}
          />
        );
      case 'add':
        return (
          <ContactForm
            onSave={handleSaveContact}
            onBack={() => navigate('contacts')}
          />
        );
      case 'detail':
        if (!selectedContact) { navigate('contacts'); return null; }
        return (
          <ContactDetail
            contact={selectedContact}
            onEdit={() => navigate('edit', selectedContact.id)}
            onBack={() => navigate('contacts')}
          />
        );
      case 'edit':
        if (!selectedContact) { navigate('contacts'); return null; }
        return (
          <ContactForm
            contact={selectedContact}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
            onBack={() => navigate('detail', selectedContact.id)}
          />
        );
    }
  }

  const navPage = page === 'detail' || page === 'edit' ? 'contacts' : page === 'add' ? 'add' : page;

  return (
    <Layout
      currentPage={navPage as 'dashboard' | 'contacts' | 'add'}
      onNavigate={p => navigate(p)}
      user={user}
      onSignOut={signOut}
      loading={contactsLoading}
      notificationAlerts={alerts}
      notificationPermission={permission}
      onRequestNotificationPermission={requestPermission}
    >
      {renderPage()}
    </Layout>
  );
}
