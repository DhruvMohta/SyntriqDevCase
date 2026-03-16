import { useEffect, useState } from 'react';

type Contact = {
  id: string;
  name: string;
  email: string;
  lifecycle_stage: string;
  source: string;
};

type ContactsResponse = {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
};

type ContactListProps = {
  onSelectContact: (id: string) => void;
  onContactsLoaded?: (contacts: Contact[]) => void;
  refreshToken?: number;
};

const API_BASE = 'http://localhost:3001';

const LIFECYCLE_STAGES = ['', 'lead', 'mql', 'sql', 'opportunity', 'customer'];
const SOURCES = ['', 'organic', 'paid', 'referral', 'direct'];

export default function ContactList({ onSelectContact, onContactsLoaded, refreshToken = 0 }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lifecycleStage, setLifecycleStage] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (lifecycleStage) {
          params.set('lifecycle_stage', lifecycleStage);
        }
        if (source) {
          params.set('source', source);
        }

        const response = await fetch(`${API_BASE}/api/contacts?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load contacts (${response.status})`);
        }

        const data: ContactsResponse = await response.json();
        setContacts(data.contacts);
        setTotalPages(Math.max(1, data.pagination.total_pages || 1));
        if (onContactsLoaded) {
          onContactsLoaded(data.contacts);
        }
      } catch (err) {
        const text = err instanceof Error ? err.message : 'Unknown contacts error';
        setError(text);
        setContacts([]);
        setTotalPages(1);
        if (onContactsLoaded) {
          onContactsLoaded([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [page, lifecycleStage, source, onContactsLoaded, refreshToken]);

  const handleLifecycleChange = (value: string) => {
    setLifecycleStage(value);
    setPage(1);
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    setPage(1);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px' }}>
      <h2>Contacts</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <label>
          Stage:{' '}
          <select value={lifecycleStage} onChange={(e) => handleLifecycleChange(e.target.value)}>
            <option value=''>All</option>
            {LIFECYCLE_STAGES.filter(Boolean).map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          Source:{' '}
          <select value={source} onChange={(e) => handleSourceChange(e.target.value)}>
            <option value=''>All</option>
            {SOURCES.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? <p>Loading contacts...</p> : null}
      {error ? <p style={{ color: '#b00020' }}>{error}</p> : null}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Stage</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Source</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              style={{ cursor: 'pointer' }}
              title='Click to view details'
            >
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{contact.name}</td>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{contact.email}</td>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{contact.lifecycle_stage}</td>
              <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{contact.source}</td>
            </tr>
          ))}
          {!isLoading && contacts.length === 0 ? (
            <tr>
              <td style={{ padding: '8px' }} colSpan={4}>
                No contacts found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
