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
exports.CrmClientService = void 0;
class CrmClientService {
    static fetchAllContacts() {
        return __awaiter(this, void 0, void 0, function* () {
            let allContacts = [];
            let currentPage = 1;
            let totalPages = 1;
            console.log('Syncing contacts from mock CRM...');
            do {
                try {
                    console.log(`Fetching page ${currentPage} of contacts from CRM...`);
                    const response = yield fetch(`${this.BASE_URL}/contacts?page=${currentPage}`);
                    if (!response.ok) {
                        throw new Error(`Error fetching contacts: ${response.statusText}`);
                    }
                    const data = yield response.json();
                    allContacts = [...allContacts, ...data.contacts];
                    totalPages = data.pagination.total_pages;
                    currentPage++;
                }
                catch (error) {
                    console.error(`Error fetching page ${currentPage} of contacts:`, error);
                    throw error;
                }
            } while (currentPage <= totalPages);
            return allContacts;
        });
    }
    static fetchContactActivities(contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.BASE_URL + '/contacts/' + contactId + '/activities');
            if (!response.ok) {
                throw new Error('Error fetching activities: ' + response.statusText);
            }
            const data = yield response.json();
            return data.activities || [];
        });
    }
}
exports.CrmClientService = CrmClientService;
CrmClientService.BASE_URL = 'http://localhost:3001/mock-crm';
