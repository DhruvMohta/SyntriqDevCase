"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const database_1 = require("../db/database");
class DatabaseService {
    static upsertContacts(contacts) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.pool.connect();
            try {
                yield client.query('BEGIN');
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
                    yield client.query(query, values);
                }
                yield client.query('COMMIT');
            }
            catch (err) {
                yield client.query('ROLLBACK');
                throw err;
            }
            finally {
                client.release();
            }
        });
    }
    static upsertActivities(contactId, activities) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.pool.connect();
            try {
                yield client.query('BEGIN');
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
                    yield client.query(query, values);
                }
                yield client.query('COMMIT');
            }
            catch (err) {
                yield client.query('ROLLBACK');
                throw err;
            }
            finally {
                client.release();
            }
        });
    }
    static logSyncRun(status_1, contactsSynced_1) {
        return __awaiter(this, arguments, void 0, function* (status, contactsSynced, errorMessage = null) {
            const query = `
    INSERT INTO sync_runs (status, contacts_synced, error_message, completed_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id;
    `;
            const values = [status, contactsSynced, errorMessage];
            const res = yield database_1.pool.query(query, values);
            return res.rows[0].id;
        });
    }
    static getContacts(page, limit, stageFilter, sourceFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = (page - 1) * limit;
            const values = [];
            let whereClauses = [];
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
            const countResult = yield database_1.pool.query(countQuery, values);
            const totalCount = parseInt(countResult.rows[0].count);
            const dataQuery = `
            SELECT * FROM contacts 
            ${whereString} 
            ORDER BY last_activity DESC NULLS LAST
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `;
            const dataResult = yield database_1.pool.query(dataQuery, [...values, limit, offset]);
            return {
                contacts: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total_count: totalCount,
                    total_pages: Math.ceil(totalCount / limit)
                }
            };
        });
    }
    static getContactWithActivities(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contactResult = yield database_1.pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
            if (contactResult.rows.length === 0)
                return null;
            const activitiesResult = yield database_1.pool.query('SELECT * FROM activities WHERE contact_id = $1 ORDER BY timestamp DESC', [id]);
            return {
                contact: contactResult.rows[0],
                activities: activitiesResult.rows
            };
        });
    }
}
exports.DatabaseService = DatabaseService;
