"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactActivities = exports.getContacts = void 0;
const seed_data_json_1 = __importDefault(require("../seed-data.json"));
const getContacts = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    // Find the requested page in our seed data
    const paginatedPage = seed_data_json_1.default.paginated_contacts.find(p => p.page === page);
    if (!paginatedPage) {
        return res.status(404).json({ error: "Page not found" });
    }
    // Return it in the same structure CrmClientService expects
    res.json({
        contacts: paginatedPage.contacts,
        pagination: {
            current_page: page,
            total_pages: seed_data_json_1.default.paginated_contacts.length,
            total_contacts: seed_data_json_1.default._info.total_contacts
        }
    });
};
exports.getContacts = getContacts;
const getContactActivities = (req, res) => {
    const { id } = req.params;
    // Look up the requested contact by ID in our seed data
    const contactData = seed_data_json_1.default.contacts_with_activities.find(c => c.contact.id === id);
    if (!contactData) {
        return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ activities: contactData.activities });
};
exports.getContactActivities = getContactActivities;
