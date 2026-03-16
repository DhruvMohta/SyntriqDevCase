import { Router } from 'express';
import { triggerSync, getContacts, getContactById } from '../controllers/coreApiController';

const router = Router();

// POST /api/sync - triggers a sync from the CRM API
router.post('/sync', triggerSync);

// GET /api/contacts - list contacts with filtering and pagination
router.get('/contacts', getContacts);

// GET /api/contacts/:id - single contact with their activity timeline
router.get('/contacts/:id', getContactById);

export default router; // <-- This is the magic line TypeScript was looking for!