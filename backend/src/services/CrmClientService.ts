export class CrmClientService {
  private static BASE_URL = 'http://localhost:3001/mock-crm';

  static async fetchAllContacts() {
    let allContacts: any[] = [];
    let currentPage = 1;
    let totalPages = 1;

    console.log('Syncing contacts from mock CRM...');

    do {
      try {
        console.log(`Fetching page ${currentPage} of contacts from CRM...`);
        const response = await fetch(`${this.BASE_URL}/contacts?page=${currentPage}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching contacts: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        allContacts = [...allContacts, ...data.contacts];
        totalPages = data.pagination.total_pages;
        currentPage++;
      } catch (error) {
        console.error(`Error fetching page ${currentPage} of contacts:`, error);
        throw error;
      }
    } while (currentPage <= totalPages);

    return allContacts;
  }

  static async fetchContactActivities(contactId: string) {
    const response = await fetch(this.BASE_URL + '/contacts/' + contactId + '/activities');
    if (!response.ok) {
      throw new Error('Error fetching activities: ' + response.statusText);
    }
    const data = await response.json();
    return data.activities || [];
  }
}
