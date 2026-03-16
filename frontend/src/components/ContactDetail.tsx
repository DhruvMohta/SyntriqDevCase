import { useEffect, useState } from 'react';

type Contact = {
  id: string;
  name: string;
  email: string;
  lifecycle_stage: string;
};

type Activity = {
  id: string;
  type: string;
  timestamp: string;
};

type ContactDetailResponse = {
  contact: Contact;
  activities: Activity[];
};

type ContactDetailProps = {
  contactId: string | null;
  refreshToken?: number;
};

const API_BASE = 'http://localhost:3001';

export default function ContactDetail({ contactId, refreshToken = 0 }: ContactDetailProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contactId) {
      setContact(null);
      setActivities([]);
      setError('');
      return;
    }

    const fetchContact = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/api/contacts/${contactId}`);
        if (!response.ok) {
          throw new Error(`Failed to load contact (${response.status})`);
        }

        const data: ContactDetailResponse = await response.json();
        setContact(data.contact);
        setActivities(data.activities);
      } catch (err) {
        const text = err instanceof Error ? err.message : 'Unknown detail error';
        setError(text);
        setContact(null);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [contactId, refreshToken]);

  return (
    <div>
      <h2>Contact Details</h2>

      {!contactId ? <p>Select a contact from the list.</p> : null}
      {isLoading ? <p>Loading contact details...</p> : null}
      {error ? <p style={{ color: '#b00020' }}>{error}</p> : null}

      {contact ? (
        <div>
          <p>
            <strong>Name:</strong> {contact.name}
          </p>
          <p>
            <strong>Email:</strong> {contact.email}
          </p>
          <p>
            <strong>Stage:</strong> {contact.lifecycle_stage}
          </p>

          <h3>Activity Timeline</h3>
          <ul style={{ paddingLeft: '18px' }}>
            {activities.map((activity) => (
              <li key={activity.id} style={{ marginBottom: '6px' }}>
                <strong>{activity.type}</strong> - {new Date(activity.timestamp).toLocaleString()}
              </li>
            ))}
            {activities.length === 0 ? <li>No activities found.</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
