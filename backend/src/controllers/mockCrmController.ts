import { Request, Response } from 'express';
import seedData from '../seed-data.json';

export const getContacts = (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    
    // Find the requested page in our seed data
    const paginatedPage = seedData.paginated_contacts.find(p => p.page === page);
    
    if (!paginatedPage) {
        return res.status(404).json({ error: "Page not found" });
    }

    // Return it in the same structure CrmClientService expects
    res.json({
        contacts: paginatedPage.contacts,
        pagination: {
            current_page: page,
            total_pages: seedData.paginated_contacts.length,
            total_contacts: seedData._info.total_contacts
        }
    });
};

export const getContactActivities = (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Look up the requested contact by ID in our seed data
    const contactData = seedData.contacts_with_activities.find(c => c.contact.id === id);
    
    if (!contactData) {
        return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ activities: contactData.activities });
};
