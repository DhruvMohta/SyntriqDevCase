import { useState } from 'react';

type SyncResponse = {
  message: string;
  contacts_synced: number;
};

const API_BASE = 'http://localhost:3001';

type SyncTriggerProps = {
  onSynced?: () => void;
};

export default function SyncTrigger({ onSynced }: SyncTriggerProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }

      const data: SyncResponse = await response.json();
      setMessage(`${data.message} (${data.contacts_synced} contacts synced)`);
      if (onSynced) {
        onSynced();
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unknown sync error';
      setIsError(true);
      setMessage(text);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      <button onClick={handleSync} disabled={isSyncing} style={{ height: '40px' }}>
        {isSyncing ? 'Syncing...' : 'Trigger Data Sync'}
      </button>
      {message ? (
        <small style={{ color: isError ? '#b00020' : '#1f7a1f', maxWidth: '320px', textAlign: 'right' }}>
          {message}
        </small>
      ) : null}
    </div>
  );
}
