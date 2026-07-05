# HostelHub Agent

HostelHub Agent is an AI-powered, full-stack MERN application for managing hostel operations. It streamlines the communication between students and hostel administration (wardens/admins) through an intuitive UI and a smart AI Assistant.

## Features

- **Student Dashboard:** View assigned room, active requests, and recent notices.
- **AI Assistant:** Chat with an AI powered by Gemini 2.0 to automatically log maintenance issues, noise complaints, or room change requests without filling out manual forms.
- **Admin Panel:** Complete role-based access control for Admins and Wardens to fully manage the hostel.

## Admin Features

The newly integrated Admin Panel provides powerful capabilities for Wardens and Admins to oversee hostel operations:

- **Enhanced Dashboard:** High-level metrics for quick insights into occupancy and pending tasks.
- **Manage Users:** View all registered users (students, wardens). Filter by role, activate/deactivate accounts, and delete users (Admin only).
- **Manage Rooms:** View room capacities and occupancy statuses.
- **Manage Requests:** View, filter, and respond to student requests. Assign statuses (`Pending`, `In Progress`, `Resolved`, `Rejected`) and leave official response comments that students can see.
- **Reports & Analytics:** Visual charts (powered by Recharts) showing request trends over the last 30 days, breakdown by status, and category distributions. Export reports to CSV.

## Getting Started

1. **Install Dependencies:**
   Run `npm install` in the root, `server`, and `client` directories.
2. **Environment Variables:**
   Create a `.env` file in the `/server` directory with your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`. (If Mongo is not running locally, the server automatically falls back to an in-memory database).
3. **Run Application:**
   Run `npm run dev` in the root directory. This uses `concurrently` to launch both the backend server and the Vite frontend.
4. **Seed Database:**
   The database automatically seeds mock users on startup if using the in-memory fallback.

### Test Accounts

- **Admin**: `admin@hostelhub.com` / `admin123`
- **Warden**: `warden@hostelhub.com` / `warden123`
- **Student**: `rahul@student.com` / `student123`
"# Hostel-Management-System" 
