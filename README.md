# EventHub – MERN Mini Event Platform

A **production-grade full-stack** event platform built with **MongoDB, Express.js, React.js, and Node.js**.

> Create, discover, and RSVP to amazing events — with AI-powered description generation, real-time capacity tracking, and race-condition-proof booking.

---

## 🔗 Live Links

| | URL |
|---|---|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend API** | `https://your-api.onrender.com/api/health` |
| **GitHub** | `https://github.com/your-username/mini-event-platform` |

---

## ✨ Features Implemented

### Core Requirements
| Feature | Status |
|---|---|
| JWT Authentication (Register / Login) | ✅ |
| Protected Routes (frontend + backend) | ✅ |
| Create Events (title, desc, date, location, capacity, image) | ✅ |
| Image Upload via Cloudinary | ✅ |
| Browse / View All Upcoming Events | ✅ |
| Edit & Delete (owner only) | ✅ |
| RSVP Join & Leave | ✅ |
| Capacity Enforcement | ✅ |
| **Race Condition / Concurrency Safety** | ✅ |
| No Duplicate RSVPs | ✅ |
| Fully Responsive UI | ✅ |

### Bonus Features
| Feature | Status |
|---|---|
| 🤖 AI Description Generation (Gemini API) | ✅ |
| 🔍 Search by title/location (Full-text index) | ✅ |
| 🏷️ Filter by Category & Date | ✅ |
| 📊 Sort by Soonest / Popular / Newest | ✅ |
| 👤 User Dashboard (My Events + Attending) | ✅ |
| 🌙 Dark / Light Mode Toggle | ✅ |
| 💪 Password Strength Meter | ✅ |
| 📱 Mobile Responsive (hamburger menu) | ✅ |
| ⚡ Optimistic UI Updates on RSVP | ✅ |
| 🎨 Glassmorphism UI + Animations | ✅ |
| 🔒 Helmet, Rate Limiting, CORS | ✅ |
| 🖼️ Drag & Drop Image Upload | ✅ |
| 🔗 Event Share (copy link) | ✅ |

---

## 🏗️ Project Structure

```
mini-event-platform/
├── server/                   # Node.js + Express Backend
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   ├── upload.js         # Cloudinary + Multer
│   │   └── errorHandler.js   # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js          # attendeeCount (atomic counter)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── rsvpController.js # ⚡ Concurrency-safe RSVP
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── users.js
│   └── server.js             # Express app entry point
│
└── client/                   # React + Vite Frontend
    └── src/
        ├── api/axios.js       # Axios with JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EventCard.jsx
        │   ├── EventForm.jsx  # Shared create/edit form
        │   ├── RSVPButton.jsx # Optimistic RSVP
        │   ├── SearchFilter.jsx
        │   ├── Footer.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── EventDetailPage.jsx
            ├── CreateEventPage.jsx
            ├── EditEventPage.jsx
            └── ProfilePage.jsx
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Custom CSS with CSS Custom Properties |
| **HTTP** | Axios with interceptors |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MongoDB + Mongoose |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |
| **Images** | Cloudinary + Multer |
| **AI** | Google Gemini API |
| **Security** | Helmet, express-rate-limit, express-validator |
| **UI Extras** | react-hot-toast, lucide-react, date-fns |

---

## ⚡ Critical: RSVP Concurrency & Capacity Strategy

> **Problem**: 100 users click RSVP simultaneously for the last spot. With a naive approach, all 100 succeed — overbooking the event.

### The Strategy: MongoDB Atomic `findOneAndUpdate`

The core insight is that MongoDB's `findOneAndUpdate` checks the filter condition **and** applies the update as a **single indivisible (atomic) operation** at the storage engine level (WiredTiger document-level locking).

```javascript
// server/controllers/rsvpController.js

// ❌ WRONG — race condition possible:
const event = await Event.findById(eventId);
if (event.attendeeCount < event.capacity) {       // Thread A and B both read TRUE here
  await Event.updateOne({ _id: eventId }, { $inc: { attendeeCount: 1 } }); // Both write!
}

// ✅ CORRECT — atomic, no race condition:
const updated = await Event.findOneAndUpdate(
  {
    _id:       eventId,
    $expr:     { $lt: ['$attendeeCount', '$capacity'] }, // ← Capacity check (atomic)
    attendees: { $ne: userId },                           // ← Duplicate check (atomic)
  },
  {
    $inc:      { attendeeCount: 1 },   // ← Increment
    $addToSet: { attendees: userId },  // ← Add user
  },
  { new: true, session }              // ← Inside a transaction
);

// If null: EITHER full OR already RSVP'd — check separately for error message
if (!updated) { /* handle specific error */ }
```

### Why This Works

| Mechanism | Purpose |
|---|---|
| `$expr: { $lt: ['$attendeeCount', '$capacity'] }` | Reads and compares both fields in the same atomic snapshot |
| `$inc: { attendeeCount: 1 }` | Increments the counter only if filter passes |
| `attendees: { $ne: userId }` | Prevents duplicate RSVP in the same atomic check |
| `$addToSet: { attendees: userId }` | Adds user (idempotent) atomically |
| **MongoDB Session + Transaction** | Wraps multi-step operations for full rollback capability |

**Result**: Even under 10,000 concurrent requests, MongoDB guarantees only one will win the last spot. All others receive `null` and get an appropriate error.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Google Gemini API key (free at aistudio.google.com)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/mini-event-platform.git
cd mini-event-platform
```

### Step 2 — Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Then edit .env with your actual values
```

Fill in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...your Atlas URI...
JWT_SECRET=make_this_long_and_random_min_32_chars
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

```bash
# Start the backend
npm run dev
# → Server running on http://localhost:5000
```

### Step 3 — Frontend Setup

```bash
cd ../client
npm install

cp .env.example .env
# .env already points to http://localhost:5000/api
```

```bash
npm run dev
# → Frontend running on http://localhost:5173
```

### Step 4 — Open the App

Visit **http://localhost:5173** in your browser. Register an account and start creating events!

---

## ☁️ Deployment

### MongoDB Atlas (Database)
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy the connection string to `MONGO_URI`

### Cloudinary (Image Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy `Cloud Name`, `API Key`, `API Secret` from your dashboard

### Render (Backend)
1. Push your code to GitHub
2. Create a new **Web Service** at [render.com](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `.env`

### Vercel (Frontend)
1. Create a new project at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| GET | `/api/events` | Optional | List events (search/filter) |
| GET | `/api/events/:id` | Optional | Get event details |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes (owner) | Update event |
| DELETE | `/api/events/:id` | Yes (owner) | Delete event |
| POST | `/api/events/ai/describe` | Yes | AI description |
| POST | `/api/events/:id/rsvp` | Yes | RSVP join |
| DELETE | `/api/events/:id/rsvp` | Yes | RSVP cancel |
| GET | `/api/users/dashboard` | Yes | User dashboard |
| GET | `/api/health` | No | Health check |

---

## 📄 License

MIT — feel free to use for your internship assignment.
