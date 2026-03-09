# ◈ InternTrack — Full-Stack Internship Application Tracker

A production-ready, full-stack internship tracker built with **React + Node.js + MongoDB**. Built for serious job seekers who want to manage every detail of their hunt.

---

## ✨ Feature Overview

### 🎯 Core
- **Full Authentication** — JWT-based register/login, protected routes
- **Rich Application Form** — 25+ fields including recruiter contact, OA tracking, compensation, perks
- **8 Status Types** — Wishlist → Applied → OA → Interview → Offer / Rejected / Withdrawn / Ghosted
- **Priority System** — Dream / High / Medium / Low
- **Domain Tagging** — Software, Data Science, Design, Product, and more

### 📊 Analytics & Dashboard
- Real-time stats: offer rate, interview rate, conversion funnel
- Monthly application trend chart
- Status + domain + priority breakdown charts
- Application goal progress tracker
- Upcoming deadline alerts (7-day window)

### 🔥 Advanced Features
- **Interview Round Tracker** — Log each round with type, date, duration, result, feedback
- **Auto Timeline** — Every status change auto-logged with timestamps
- **Resume Manager** — Upload/manage multiple resume versions (PDF/DOC), set default
- **Interview Notes** — Color-coded notes with pin, tags, category filter (masonry grid)
- **Bulk Actions** — Select all, bulk delete, bulk status update
- **CSV Export** — Export all applications to CSV
- **Deadline Email Reminders** — Nodemailer integration (configure SMTP in .env)
- **Advanced Filtering** — Search + status + domain + sort + pagination
- **Favorites & Archiving** — Star important applications
- **Recruiter Tracking** — Name, email, LinkedIn, referral info per application

---

## 📁 Project Structure

```
internship-tracker/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx       # Sidebar + topbar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx        # Stats, charts, deadlines
│   │   │   ├── Applications.jsx     # List, search, filter, export
│   │   │   ├── AddApplication.jsx   # Create/edit form (25+ fields)
│   │   │   ├── ApplicationDetail.jsx # Timeline, interview rounds
│   │   │   ├── ResumeManager.jsx    # Upload & manage resumes
│   │   │   ├── InterviewNotes.jsx   # Notes with masonry layout
│   │   │   ├── Analytics.jsx        # Deep analytics charts
│   │   │   └── Settings.jsx         # Profile, preferences, password
│   │   ├── services/
│   │   │   └── api.js               # Axios API service layer
│   │   ├── App.jsx                  # Router setup
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Express.js backend
│   ├── models/
│   │   ├── User.js            # User profile + settings
│   │   ├── Application.js     # Rich application schema
│   │   ├── Resume.js          # Resume file metadata
│   │   └── Note.js            # Interview notes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── applicationController.js  # CRUD + bulk + export
│   │   ├── statsController.js        # Aggregation pipeline
│   │   ├── resumeController.js       # Multer file upload
│   │   └── noteController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── statsRoutes.js
│   │   └── reminderRoutes.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── uploads/               # Resume file storage (auto-created)
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── package.json               # Root scripts
└── README.md
```

---

## 🚀 Setup & Run Locally

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

### Step 1: Install dependencies

```bash
cd internship-tracker
npm run install:all
```

This installs root, client, and server dependencies.

### Step 2: Configure environment

```bash
cd server
cp .env.example .env
```

Edit `.env` and set your MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/interntrack
JWT_SECRET=change_this_to_a_random_secret_string
```

### Step 3: Run the app

```bash
# From the root folder
npm run dev
```

This starts both:
- **Backend** at `http://localhost:5000`
- **Frontend** at `http://localhost:5173`

Open `http://localhost:5173` in your browser and register a new account.

---

## 🌐 Deploy to Production

### Option A: Railway (easiest)
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add MongoDB plugin or connect Atlas
4. Set environment variables
5. Deploy both services

### Option B: Render + Vercel
- Deploy `server/` to [Render](https://render.com) (free Node.js hosting)
- Deploy `client/` to [Vercel](https://vercel.com) after `npm run build`
- Set `VITE_API_URL` in Vercel to your Render backend URL

### Option C: VPS (Ubuntu)
```bash
# Build frontend
cd client && npm run build

# Serve with nginx + PM2
pm2 start server/server.js --name interntrack
```

---

## 🐙 Push to GitHub

```bash
cd internship-tracker
git init
git add .
git commit -m "feat: full-stack InternTrack internship tracker"
git remote add origin https://github.com/YOUR_USERNAME/internship-tracker.git
git branch -M main
git push -u origin main
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts |
| Styling | Inline styles + Google Fonts (Syne + DM Sans) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, express-validator |
| Dev Tools | Vite, Nodemon, Concurrently |

---

## 📌 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/password` — Change password

### Applications
- `GET /api/applications` — List (with filters, pagination)
- `POST /api/applications` — Create
- `GET /api/applications/:id` — Get detail
- `PUT /api/applications/:id` — Update
- `DELETE /api/applications/:id` — Delete
- `POST /api/applications/bulk-delete` — Bulk delete
- `PUT /api/applications/bulk-status` — Bulk status update
- `POST /api/applications/:id/timeline` — Add timeline event
- `POST /api/applications/:id/interview-rounds` — Add round
- `GET /api/applications/export/csv` — Export CSV
- `GET /api/applications/deadlines/upcoming` — Upcoming deadlines

### Stats, Resumes, Notes, Reminders
- `GET /api/stats/overview`
- `GET/POST /api/resumes`
- `GET/POST/PUT/DELETE /api/notes`
- `POST /api/reminders/test-email`

---


Made with ❤️ | MIT License

<img width="1907" height="915" alt="image" src="https://github.com/user-attachments/assets/d433e4c8-9c2b-4238-855e-d48292af32c5" />
