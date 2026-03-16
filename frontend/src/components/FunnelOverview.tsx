type Contact = {
  id: string;
  lifecycle_stage: string;
};

type FunnelOverviewProps = {
  contacts: Contact[];
};

const STAGES = ['lead', 'mql', 'sql', 'opportunity', 'customer'];

export default function FunnelOverview({ contacts }: FunnelOverviewProps) {
  const counts = STAGES.map((stage) => ({
    stage,
    count: contacts.filter((contact) => contact.lifecycle_stage === stage).length,
  }));

  const maxCount = Math.max(1, ...counts.map((item) => item.count));

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
      <h2>Funnel Overview</h2>

      {counts.map((item) => {
        const widthPercent = Math.max(6, (item.count / maxCount) * 100);
        return (
          <div key={item.stage} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{item.stage}</span>
              <span>{item.count}</span>
            </div>
            <div style={{ background: '#f1f1f1', height: '14px', borderRadius: '4px' }}>
              <div
                style={{
                  height: '14px',
                  width: `${widthPercent}%`,
                  background: '#2563eb',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
