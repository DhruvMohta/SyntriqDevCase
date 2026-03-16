"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockCrmController_1 = require("../controllers/mockCrmController");
const router = (0, express_1.Router)();
router.get('/contacts', mockCrmController_1.getContacts);
router.get('/contacts/:id/activities', mockCrmController_1.getContactActivities);
exports.default = router; // <-- Ensure this is here!
