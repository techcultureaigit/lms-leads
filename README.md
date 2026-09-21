# LMS Leads — TechCulture Lead Management

Internal CRM for TechCulture to manage leads, follow-ups, users, roles, and Google Meet scheduling.

## Features

- Dashboard with live lead metrics
- Leads CRUD + full-page lead view
- CSV / Excel bulk import
- Follow-ups & calendar
- Users with roles & permissions
- Custom Roles CRUD
- Google Calendar connect + auto Meet link for Online meetings
- Collapsible sidebar UI

## Tech Stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js (App Router), React, TypeScript |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| Integrations | Google Calendar / Meet OAuth |

## Project Structure

```text
lms-leads/
├── frontend/     # Next.js app (port 3000)
├── backend/      # Express API (port 5000)
└── README.md
