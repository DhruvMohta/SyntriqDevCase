"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coreApiController_1 = require("../controllers/coreApiController");
const router = (0, express_1.Router)();
// POST /api/sync - triggers a sync from the CRM API
router.post('/sync', coreApiController_1.triggerSync);
// GET /api/contacts - list contacts with filtering and pagination
router.get('/contacts', coreApiController_1.getContacts);
// GET /api/contacts/:id - single contact with their activity timeline
router.get('/contacts/:id', coreApiController_1.getContactById);
exports.default = router; // <-- This is the magic line TypeScript was looking for!
