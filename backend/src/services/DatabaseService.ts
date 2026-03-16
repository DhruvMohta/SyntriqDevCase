import {pool} from '../db/database';

type ContactRecord = {
  id: string;
  name: string;
  email: string;
  company: string;
  lifecycle_stage: string;
  last_activity: string;
  deal_value: number;
  source: string;
};

type ActivityRecord = {
  id: string;
  type: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export class DatabaseService {
  static async upsertContacts(contacts: ContactRecord[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const contact of contacts) {
        const query = `
          INSERT INTO contacts (id, name, email, company, lifecycle_stage, last_activity, deal_value, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            company = EXCLUDED.company,
            lifecycle_stage = EXCLUDED.lifecycle_stage,
            last_activity = EXCLUDED.last_activity,
            deal_value = EXCLUDED.deal_value,
            source = EXCLUDED.source;
          `;
          const values = [
            contact.id,
            contact.name, contact.email, contact.company, contact.lifecycle_stage,
            contact.last_activity, contact.deal_value, contact.source
          ];
          await client.query(query, values);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async upsertActivities(contactId: string, activities: ActivityRecord[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const activity of activities) {
        const query = `
          INSERT INTO activities (id, contact_id, type, timestamp, metadata)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            contact_id = EXCLUDED.contact_id,
            type = EXCLUDED.type,
            timestamp = EXCLUDED.timestamp,
            metadata = EXCLUDED.metadata;
        `;
        const values = [activity.id, contactId, activity.type, activity.timestamp, activity.metadata || {}];
        await client.query(query, values);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async logSyncRun(status: string, contactsSynced: number, errorMessage: string | null= null) {
    const query = `
    INSERT INTO sync_runs (status, contacts_synced, error_message, completed_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id;
    `;
    const values = [status, contactsSynced, errorMessage];
    const res = await pool.query(query, values);
    return res.rows[0].id;
  }

  static async getContacts(page: number, limit: number, stageFilter?: string, sourceFilter?: string) {
        const offset = (page - 1) * limit;
        const values: any[] = [];
        let whereClauses: string[] = [];

        if (stageFilter) {
            values.push(stageFilter);
            whereClauses.push(`lifecycle_stage = $${values.length}`);
        }
        if (sourceFilter) {
            values.push(sourceFilter);
            whereClauses.push(`source = $${values.length}`);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) FROM contacts ${whereString}`;
        const countResult = await pool.query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        const dataQuery = `
            SELECT * FROM contacts 
            ${whereString} 
            ORDER BY last_activity DESC NULLS LAST
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `;
        const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

        return {
            contacts: dataResult.rows,
            pagination: {
                page,
                limit,
                total_count: totalCount,
                total_pages: Math.ceil(totalCount / limit)
            }
        };
    }

    static async getContactWithActivities(id: string) {
        const contactResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
        if (contactResult.rows.length === 0) return null;

        const activitiesResult = await pool.query(
            'SELECT * FROM activities WHERE contact_id = $1 ORDER BY timestamp DESC', 
            [id]
        );

        return {
            contact: contactResult.rows[0],
            activities: activitiesResult.rows
        };
    }

}
