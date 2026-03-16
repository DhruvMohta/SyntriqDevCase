import { Router } from 'express';
import { getContacts, getContactActivities } from '../controllers/mockCrmController';

const router = Router();

router.get('/contacts', getContacts);
router.get('/contacts/:id/activities', getContactActivities);

export default router; // <-- Ensure this is here!