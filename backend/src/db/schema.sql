CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    lifecycle_stage VARCHAR(50),
    last_activity TIMESTAMP,
    deal_value DECIMAL(12, 2),
    source VARCHAR(100)
);

CREATE INDEX idx_contacts_lifecycle_stage ON contacts(lifecycle_stage);
CREATE INDEX idx_contacts_source ON contacts(source);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(255) PRIMARY KEY,
    contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata JSONB
);

CREATE INDEX idx_activities_contact_id ON activities(contact_id);

CREATE TABLE IF NOT EXISTS sync_runs (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    contacts_synced INTEGER DEFAULT 0,
    error_message TEXT
);
