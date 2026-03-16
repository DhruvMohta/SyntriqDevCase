# Syntriq - Contact Sync Dashboard

This repository contains the Full Stack Developer Case for Syntriq[cite: 1, 5]. It includes a Node/Express/TypeScript backend, a React frontend, and a PostgreSQL database setup. This is a very basic implementation, time spent was under 4 hours as needed to get more familiarity with this techstack.

## Setup Instructions

### 1. Database Setup (Docker)
Ensure Docker is running, then spin up the PostgreSQL container:
\`\`\`bash
docker run --name syntriq-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=syntriq -p 5432:5432 -d postgres:15
\`\`\`

Inject the database schema:
\`\`\`bash
# On Windows PowerShell:
Get-Content backend\src\db\schema.sql | docker exec -i syntriq-postgres psql -U postgres -d syntriq
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the server:
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*(Note: Ensure `seed-data.json` is located in `backend/src/` for the mock CRM to function).*

### 3. Frontend Setup
In a new terminal, navigate to the frontend directory, install dependencies, and start the Vite dev server:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

---

##  Design Questions

### a) The real CRM API has rate limits (100 requests/min), occasional 500 errors, and sometimes returns stale data. How would you make your sync service production-ready? What retry and backoff strategy would you use? How would you handle partial failures (e.g., page 3 of 5 fails)?
*(To prevent a timeout while syncing thousands of contacts, we could have like a separate background process that picks up sort of like a note from server to continue to sync and do work while the use does not need to really wait. Apparently this is called a Message Queue (Gemini AI suggested BullMQ or Rabbit MQ, though not sure how it really would work). Next, if a CRM allows only some amount of requests per minute then we could simply wait a while and then retry, giving the server time to breather before we hit it again (Just a solution, not sure if this is the most optimal one). We could save our cursor in the db. So instead of just saving "starter" and "finished", we can add a column called LastSuccessfulPage. So if pg1 finishes, we save we update this to 1, then keep doing this till it crashes. Once it crashes at like pg 3 we would trigger retry and the background process sees we are up to date with pg 2 and simply resumes back at pg 3 exactly)*

### b) Tomorrow we add Google Ads and LinkedIn as data sources, each with completely different schemas and API patterns. How would you evolve your current codebase to support this without duplicating sync logic? What abstractions would you introduce?
*(Tomorrow we might need to add Google Ads and LinkedIn, which have completely different schemas and API patterns. To evolve the codebase without duplicating the sync logic, Gemini taught me about something called the "Adapter Pattern". Basically, we would create a single, standard Contact format for our own database. Then, for each new source like LinkedIn, we just write a specific adapter. This adapter's only job is to take the messy external data and translate it into our clean format. This way, our main database saving logic doesn't even need to know where the data came from, it just does its normal job. It seems like a smart way to keep things organized.)*

### A user wants the dashboard to update live as new data syncs in. What approach would you take (polling, SSE, WebSockets, something else)? What are the tradeoffs given a small team and fast iteration cycle?
*(If a user wants the dashboard to update live as new data syncs in, there are a few ways to do it. WebSockets sound cool because they are truly real-time, but they seem to require a lot of extra setup and maintenance on the server. Given the tradeoff of having a small team and needing fast iteration cycles, setting up WebSockets might be overkill right now. Instead, using Server-Sent Events (SSE) or just simple Short Polling (asking the server for updates every couple of seconds) seems like a nice and simple approach? It gives that "live" feel without the whole thing feeling like an over-kill.)*

### What would you instrument in this system to debug issues in production? Think about: sync failures, slow queries, external API latency, data freshness. What is worth building in a PoC vs. deferring?
*To debug issues in production, we need to track things like sync failures, slow queries, external API latency, and data freshness. For this PoC, we actually already built a solid foundation by making the sync_runs table. This tracks when syncs start and complete, their status, and any errors encountered. If we were moving to a real production environment (deferring this for now), we could add advanced tools to monitor how slow the queries are, or to automatically alert if a sync fails. But for a quick PoC, the database table right now is a simple and basic start.*

---

## 🛠️ What I would improve with more time (Pragmatism Notes)

Given the tight timebox, I prioritized basic architectural structure, data modeling, and the needed API integration over deep polish. If I had more time, I would improve:
* **Shared Types:** Create a shared TypeScript types library so the frontend and backend share the exact same `Contact` and `Activity` interfaces.
* **Input Validation:** Add a maybe a feature to validate incoming API requests and external CRM payloads before they hit the database (What engineering has taught me, better to reduce risk during initialisation than at deployment stage :3).
* **UI/UX Polish:** The current one is just so basic, most styling is with help of references online and from genAI tools. But surely taking up something existing which is nice, and then polishing it to our need would indeed be nice ;).
* **Testing:** Add a bunch of tests for the backend API routes and React Testing Library tests for the component states.