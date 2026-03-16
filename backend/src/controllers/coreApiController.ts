import { Request, Response } from 'express';
import { CrmClientService } from '../services/CrmClientService';
import { DatabaseService } from '../services/DatabaseService';

export const triggerSync = async (req: Request, res: Response) => {
    try {
        // Fetch all contacts from mock CRM.
        const contacts = await CrmClientService.fetchAllContacts();

        // Upsert contacts to PostgreSQL.
        await DatabaseService.upsertContacts(contacts);

        // Fetch and upsert activities for each contact.
        for (const contact of contacts) {
            const activities = await CrmClientService.fetchContactActivities(contact.id);
            await DatabaseService.upsertActivities(contact.id, activities);
        }

        // Log successful sync run.
        await DatabaseService.logSyncRun('completed', contacts.length);

        res.json({ 
            message: "Sync completed successfully!", 
            contacts_synced: contacts.length 
        });

    } catch (error: any) {
        // Log failure for auditing.
        await DatabaseService.logSyncRun('failed', 0, error.message);
        
        res.status(500).json({ 
            error: "Sync failed", 
            details: error.message 
        });
    }
};

export const getContacts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const stage = req.query.lifecycle_stage as string;
        const source = req.query.source as string;

        const data = await DatabaseService.getContacts(page, limit, stage, source);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
    }
};

export const getContactById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = await DatabaseService.getContactWithActivities(id);
        
        if (!data) {
            return res.status(404).json({ error: "Contact not found" });
        }
        
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch contact details", details: error.message });
    }
};