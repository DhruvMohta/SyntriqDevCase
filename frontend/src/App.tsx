import { useState } from 'react';
import ContactList from './components/ContactList';
import FunnelOverview from './components/FunnelOverview';
import ContactDetail from './components/ContactDetail';
import SyncTrigger from './components/SyncTrigger';

type Contact = {
  id: string;
  lifecycle_stage: string;
};

function App() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>CRM Dashboard</h1>
        <SyncTrigger onSynced={() => setRefreshToken((value) => value + 1)} />
      </header>
      
      <main style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <FunnelOverview contacts={contacts} />
          <ContactList
            onSelectContact={setSelectedContactId}
            onContactsLoaded={setContacts}
            refreshToken={refreshToken}
          />
        </div>

        <aside style={{ border: '1px solid #ccc', padding: '15px' }}>
          <ContactDetail contactId={selectedContactId} refreshToken={refreshToken} />
        </aside>
      </main>
    </div>
  );
}

export default App;
