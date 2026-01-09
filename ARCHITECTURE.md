# 🏗️ StudyBuddy Deployment Architecture

Visual guide to understanding how StudyBuddy components connect in production.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION SETUP                              │
└─────────────────────────────────────────────────────────────────────────┘

USER'S BROWSER
     │
     │ HTTPS
     ├──────────────────────────────────┐
     │                                   │
     ▼                                   ▼
┌──────────────────┐          ┌──────────────────┐
│  VERCEL (CDN)    │          │  VERCEL (API)    │
│  Frontend Build  │          │  Static Files    │
│  React App       │          │  dist/ folder    │
│  (React Router)  │          │                  │
└────────┬─────────┘          └──────────────────┘
         │
         │ API Requests
         │ JSON + Headers
         │
         ▼
    ┌─────────────────────────────────────┐
    │   RENDER / RAILWAY                  │
    │   Backend Server (Node.js + Express)│
    │                                     │
    │  ├─ /api/auth    (Login, Register) │
    │  ├─ /api/users   (Profile, Friends)│
    │  ├─ /api/study   (Sessions)        │
    │  └─ /health      (Status Check)    │
    └────────┬────────────────────────────┘
             │
             │ TCP Connection
             │ MongoDB Protocol
             │
             ▼
    ┌──────────────────────────┐
    │  MONGODB ATLAS (Cloud)   │
    │  - Collections           │
    │  - Users                 │
    │  - Study Sessions        │
    │  - Study Schedules       │
    │  - Relationships         │
    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     REAL-TIME CONNECTIONS (Socket.io)                   │
└─────────────────────────────────────────────────────────────────────────┘

Frontend Browser              Backend Server         Active Connections
     │                             │
     ├─ WebSocket              ├─ activeUsers Map
     │  (Bidirectional)        │  (In-Memory)
     │                         │
     ├─ friend_started_         │
     │  studying event         ├─ Emit notifications
     │                         │  to friends
     ├─ online_friends         │
     │  event                  └─ Update friend status
     │
     └─ Persistent Socket Connection
        (stays open until disconnect)
```

---

## 🔄 Request Flow Examples

### Example 1: User Registration

```
┌─────────────────┐
│  User Browser   │
│  (Vercel)       │
└────────┬────────┘
         │
         │ POST /api/auth/register
         │ {email, username, password}
         │
         ▼
┌─────────────────────────────────┐
│   Express Backend (Render)      │
│                                 │
│  1. Hash password               │
│  2. Generate OTP                │
│  3. Save user (unverified)      │
│  4. Send email with OTP         │
└────────┬────────────────────────┘
         │
         ├─ Save to MongoDB ──┐
         │                    │
         └─ Send email ──┐    │
                         │    │
                    ┌────▼──┬▼────┐
                    │ Email │ DB  │
                    │Service│     │
                    └────┬──┴─────┘
                         │
         ┌───────────────┤
         │               │
         ▼               ▼
    Gmail SMTP      MongoDB
    Sends OTP       Stores User


┌─────────────────────────┐
│  User's Email Inbox     │
│  (Receives OTP)         │
└─────────────────────────┘
```

### Example 2: Real-Time Study Session

```
User A (Browser)          Backend (Render)          User B (Browser)
      │                          │                       │
      │ emit('start_study')      │                       │
      ├─────────────────────────>│                       │
      │                          │                       │
      │                    Save to DB                    │
      │                    activeUsers.set()             │
      │                          │                       │
      │                    emit('friend_               │
      │                  started_studying')             │
      │                          │                       │
      │                          ├──────────────────────>│
      │                          │         Event arrives │
      │                    (Browser updates)             │
      │                          │       Navbar shows    │
      │                          │      "User A studying"│
      │                          │                       │
      (Time passes...)                                   │
      │                          │                       │
      │ emit('stop_study')       │                       │
      ├─────────────────────────>│                       │
      │                          │                       │
      │                    Save session                  │
      │                    Update stats                  │
      │                    Remove from                   │
      │                    activeUsers                   │
      │                          │                       │
      │                    emit('friend_               │
      │                  stopped_studying')             │
      │                          │                       │
      │                          ├──────────────────────>│
      │                          │    Event arrives      │
      │                          │  (Browser updates)    │
      │                          │   Removes from UI     │
```

---

## 🗂️ Data Flow

### User Registration Data Flow

```
Frontend Form
     │
     ├─ username: "john"
     ├─ email: "john@example.com"
     └─ password: "secret123"
          │
          ▼
   POST /api/auth/register
          │
          ▼
┌─────────────────────────────┐
│  Backend Validation         │
│                             │
│  ✓ Email format valid?      │
│  ✓ Password strong enough?  │
│  ✓ Not already registered?  │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Secure Hashing             │
│                             │
│  password: "secret123"      │
│       ↓ (bcryptjs)          │
│  hash: "$2a$10$XYZ..."      │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Generate OTP               │
│                             │
│  otp: "123456"              │
│  expires: now + 10 minutes  │
└─────────────────────────────┘
          │
          ├─ Save user + otp to MongoDB
          │
          └─ Send email
               │
               ▼
          Gmail SMTP
               │
               ▼
          User's Inbox
```

---

## 🔐 Security Data Flow

```
┌──────────────────────────────────────┐
│      LOGIN REQUEST                   │
│                                      │
│  POST /api/auth/login                │
│  {email, password}                   │
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Find user by    │
         │ email in DB     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────────────┐
         │ Compare request password│
         │ with stored hash        │
         │ (bcryptjs.compare)      │
         └────────┬────────────────┘
                  │
         ┌────────┴──────────┐
         │                   │
      ✅ Match         ❌ No match
         │                   │
         ▼                   ▼
    ┌─────────┐         ┌──────────┐
    │ Generate│         │ Return   │
    │ JWT     │         │ 401      │
    │ Token   │         │ Error    │
    └────┬────┘         └──────────┘
         │
         ▼
    ┌─────────────────────┐
    │ Return token to     │
    │ frontend            │
    │                     │
    │ token: "eyJhbGc..." │
    └────────┬────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Frontend stores in  │
    │ localStorage        │
    │                     │
    │ Authorization:      │
    │ Bearer eyJhbGc...   │
    └─────────────────────┘
```

---

## 📡 Connection Types

### REST API (Synchronous)

```
Frontend
    │
    ├─ GET /api/users/profile
    ├─ POST /api/study/sessions
    ├─ PUT /api/users/:id
    ├─ DELETE /api/study/:id
    │
    └─→ Backend (Wait for response)
           │
           ├─ Process request
           ├─ Query database
           ├─ Return response
           │
        Response
           │
        201 Created ──→ Frontend updates
        400 Bad Request ──→ Show error
        500 Error ──→ Retry
```

### WebSocket (Real-Time)

```
Frontend ←──────────────────────→ Backend
    │                               │
    ├─ Persistent TCP connection    │
    │   (stays open until close)     │
    │                               │
    ├─ Socket events (bidirectional)│
    │                               │
    ├─ Instant data push            │
    │   (no polling needed)          │
    │                               │
    └─ Lower latency                │
        (good for real-time)
```

---

## 🌍 Environment Variables & Where They're Used

```
┌─────────────────────────────────────────────────────────────┐
│  BACKEND ENVIRONMENT VARIABLES                              │
│  (Set in Render/Railway Dashboard)                          │
└─────────────────────────────────────────────────────────────┘

NODE_ENV          ──→  Server behavior (dev vs prod logging)
PORT              ──→  Server listen port
JWT_SECRET        ──→  Sign/verify JWT tokens
MONGODB_URI       ──→  Database connection
FRONTEND_URL      ──→  CORS origin whitelist
EMAIL_USER        ──→  Send emails from this account
EMAIL_PASS        ──→  Gmail app password for SMTP


┌─────────────────────────────────────────────────────────────┐
│  FRONTEND ENVIRONMENT VARIABLES                             │
│  (Set in Vercel Dashboard)                                  │
│  (Used during build time via import.meta.env)              │
└─────────────────────────────────────────────────────────────┘

VITE_API_URL      ──→  Backend API base URL
                       import.meta.env.VITE_API_URL
                       ↓
                  axios.defaults.baseURL = VITE_API_URL

VITE_SOCKET_URL   ──→  WebSocket server URL
                       import.meta.env.VITE_SOCKET_URL
                       ↓
                  io(VITE_SOCKET_URL, {auth})
```

---

## 📊 Database Schema Overview

```
MongoDB Collections
│
├─ users
│  ├─ _id (ObjectId)
│  ├─ username (String)
│  ├─ email (String)
│  ├─ password (String, bcrypted)
│  ├─ avatar (String, upload path)
│  ├─ isEmailVerified (Boolean)
│  ├─ friends [Array of user IDs]
│  ├─ friendInviteCode (String, unique)
│  ├─ studySessions [Array of sessions]
│  ├─ studySchedules [Array of schedules]
│  ├─ totalStudyTime (Number)
│  └─ createdAt (Date)
│
└─ (Notes: Data is embedded in users collection,
   no separate collections needed for this app)
```

---

## 🔄 Deployment Platform Data Flow

```
Developer
    │
    ├─ Makes changes
    ├─ Commits code
    └─ Pushes to main branch
         │
         ▼
    GitHub
         │
         ├─ Push webhook to Render
         └─ Push webhook to Vercel
              │                │
              ▼                ▼
        Render Backend    Vercel Frontend
              │                │
              ├─ Pull code      ├─ Pull code
              ├─ npm install    ├─ npm install
              ├─ Start app      ├─ npm run build
              │                 ├─ Optimize assets
              │                 ├─ Deploy to CDN
              │                 │
              ▼                 ▼
        Live Backend       Live Frontend
        (onrender.com)      (vercel.app)
             │                  │
             └──────────────────┘
                     │
                     ▼
            Users can access app
```

---

## ✅ Pre-Deployment Checklist (Technical)

```
Environment Variables Setup
├─ Backend
│  ├─ NODE_ENV=production ✓
│  ├─ JWT_SECRET (secure random) ✓
│  ├─ MONGODB_URI (test connection) ✓
│  ├─ FRONTEND_URL (exact match) ✓
│  └─ EMAIL_USER/PASS (tested) ✓
│
└─ Frontend
   ├─ VITE_API_URL (correct backend) ✓
   └─ VITE_SOCKET_URL (correct backend) ✓

Database Setup
├─ MongoDB Atlas cluster created ✓
├─ Database user created ✓
├─ IP whitelist configured ✓
└─ Connection tested ✓

Code Quality
├─ .env in .gitignore ✓
├─ No secrets in code ✓
├─ Error handling present ✓
└─ All tests pass ✓

Security
├─ CORS configured correctly ✓
├─ JWT properly implemented ✓
├─ Passwords hashed (bcrypt) ✓
├─ No sensitive logs ✓
└─ HTTPS enforced ✓
```

---

## 🎯 Common Connectivity Issues & Their Causes

```
┌──────────────────────────┐
│ Problem: Blank Page      │
├──────────────────────────┤
│ Cause: Wrong API URL     │
│ Check: VITE_API_URL      │
│ Fix: Update Vercel env   │
└──────────────────────────┘

┌──────────────────────────┐
│ Problem: 404 API Error   │
├──────────────────────────┤
│ Cause: Backend not       │
│        running/found     │
│ Check: Backend status    │
│ Fix: Check Render logs   │
└──────────────────────────┘

┌──────────────────────────┐
│ Problem: Socket.io       │
│         not connecting   │
├──────────────────────────┤
│ Cause: Wrong socket URL  │
│ Check: VITE_SOCKET_URL   │
│ Fix: Must NOT include /api
└──────────────────────────┘

┌──────────────────────────┐
│ Problem: CORS Error      │
├──────────────────────────┤
│ Cause: Frontend URL not  │
│        in whitelist      │
│ Check: FRONTEND_URL env  │
│ Fix: Update in backend   │
└──────────────────────────┘
```

---

**This guide helps you understand how all components connect in production. 
Refer back when troubleshooting or optimizing your deployment!**
