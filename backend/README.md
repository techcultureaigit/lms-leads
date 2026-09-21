# TechCulture Lead API (Backend)

Node.js + Express + MongoDB (Mongoose) API for the Lead Management frontend.

## Folder structure

```
backend/
├── server.js
├── .env.example
├── package.json
└── src/
    ├── app.js
    ├── config/db.js
    ├── models/          User, Lead, Activity
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── utils/
    └── scripts/seed.js
```

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Edit `.env` — paste your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.40lba9d.mongodb.net/techculture?retryWrites=true&w=majority
JWT_SECRET=any-long-secret-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

3. Install & run:

```bash
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`

## Default admin (after seed)

- Email: `admin@techculture.com`
- Password: `Admin@123`

## Main routes

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | No | |
| POST | `/api/auth/register` | No | |
| POST | `/api/auth/login` | No | |
| GET | `/api/auth/me` | Yes | |
| GET | `/api/dashboard?range=` | Yes | `all` \| `today` \| `week` \| `month` |
| GET | `/api/leads` | Yes | List + search/filter/pagination |
| POST | `/api/leads` | Yes | Create lead |
| GET | `/api/leads/:id` | Yes | View one lead |
| PUT | `/api/leads/:id` | Yes | Edit lead |
| DELETE | `/api/leads/:id` | Yes | Delete lead |
| POST | `/api/leads/bulk/update` | Yes | Bulk status/owner/followup |
| POST | `/api/leads/bulk/delete` | Yes | Bulk delete |
| GET/POST | `/api/users` | Yes | |
| GET | `/api/activities/lead/:leadId` | Yes | |
| POST | `/api/activities/lead/:leadId/notes` | Yes | |

### Leads query params (GET `/api/leads`)

`q`, `status`, `owner`, `product`, `followupFrom`, `followupTo`, `overdue=1`, `page`, `limit`, `sort`

### Create / Edit body

`entity`, `contact`, `mobile`, `owner`, `assigned` (required)  
`products` (required array), `email`, `location`, `website`, `status`, `followup`, `notes`, `meetingDate`, `meetingType`, `lostDate`, `wonDate`

Use header: `Authorization: Bearer <token>`
