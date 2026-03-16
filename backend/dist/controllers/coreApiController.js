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
exports.getContactById = exports.getContacts = exports.triggerSync = void 0;
const CrmClientService_1 = require("../services/CrmClientService");
const DatabaseService_1 = require("../services/DatabaseService");
const triggerSync = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all contacts from mock CRM.
        const contacts = yield CrmClientService_1.CrmClientService.fetchAllContacts();
        // Upsert contacts to PostgreSQL.
        yield DatabaseService_1.DatabaseService.upsertContacts(contacts);
        // Fetch and upsert activities for each contact.
        for (const contact of contacts) {
            const activities = yield CrmClientService_1.CrmClientService.fetchContactActivities(contact.id);
            yield DatabaseService_1.DatabaseService.upsertActivities(contact.id, activities);
        }
        // Log successful sync run.
        yield DatabaseService_1.DatabaseService.logSyncRun('completed', contacts.length);
        res.json({
            message: "Sync completed successfully!",
            contacts_synced: contacts.length
        });
    }
    catch (error) {
        // Log failure for auditing.
        yield DatabaseService_1.DatabaseService.logSyncRun('failed', 0, error.message);
        res.status(500).json({
            error: "Sync failed",
            details: error.message
        });
    }
});
exports.triggerSync = triggerSync;
const getContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const stage = req.query.lifecycle_stage;
        const source = req.query.source;
        const data = yield DatabaseService_1.DatabaseService.getContacts(page, limit, stage, source);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
    }
});
exports.getContacts = getContacts;
const getContactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = yield DatabaseService_1.DatabaseService.getContactWithActivities(id);
        if (!data) {
            return res.status(404).json({ error: "Contact not found" });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch contact details", details: error.message });
    }
});
exports.getContactById = getContactById;
