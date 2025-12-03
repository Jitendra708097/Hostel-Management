
# Hostel Management (HRIT University Hostels)

Deployed app

Deployed Web Application IP: https://13.233.230.164

This repository contains a full-stack Hostel Management application for HRIT University (student hostels). It includes a React + Vite front-end and a Node.js + Express back-end with MongoDB for persistence and Redis for session/cache-related usage.

This project provides features for students and admins:

- Student features (client):
	- Registration and login (react-hook-form + Zod validation)
	- View and update profile (photo upload via Cloudinary)
	- View weekly mess menu, attendance, fees, leave requests, and circulars
	- Submit grievances

- Admin features (server + admin UI):
	- Manage students (assign/update/delete, fee assignment)
	- Update weekly mess menu
	- Publish circulars
	- View and manage attendance, leaves and grievances

Key implemented server-side modules:

- Authentication (JWT + middleware)
- User & student management
- Menu management (CRUD for daily meals)
- Attendance tracking
- Leave requests and grievance handling
- Cloudinary integration for media uploads

Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB)
- Caching / session: Redis (used for authentication/session tokens)
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Forms & validation: react-hook-form + Zod
- HTTP client: axios
- Media: Cloudinary

Main folders

- `server/` - Express API, controllers, routes, models, middleware
- `client/` - React app (Vite), components, Redux store, styles

Getting started (development)

1. Clone the repo

```bash
git clone <repo-url>
cd Hostel
```

2. Start the server

```powershell
cd server
npm install
nodemon src/index.js
```

3. Start the client

```powershell
cd client
npm install
npm run dev
```

Environment variables

- Create `.env` files for server and client as needed. Important variables include:
	- `MONGO_URI` — MongoDB connection string
	- `CLOUDINARY_*` — cloudinary credentials
	- `REDIS_URL` — redis connection
	- `JWT_SECRET` — jwt signing secret
	- `VITE_API_URL` — API base URL for the client

API notes

- The server exposes REST endpoints under `/user`, `/menu`, `/fees`, `/attendance`, etc. Some admin routes require an admin token and are protected by middleware.


Replace the placeholder above with your actual deployed URL.

Contributing

- Please open an issue or submit a PR for bug fixes and features.

Known issues & TODO

- Grievance workflow improvements (some parts are in-progress)
- Additional tests and CI
- Improve accessibility and mobile responsiveness across all pages

License

- Add your preferred license here.

Contact

- For questions or help, contact the project owner.
