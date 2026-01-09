# StudyTogether - Interview Quick Reference Guide

## 🎯 Project in 30 Seconds

**StudyTogether** is a collaborative study platform built with MERN stack. It helps students track study time, connect with friends, schedule sessions, and view analytics. Features include real-time friend activity, Pomodoro timer, achievements, leaderboards, and email notifications.

---

## 🛠️ Tech Stack Summary

### Frontend
- **React 19** + **Vite** (fast dev server, optimized builds)
- **Tailwind CSS** (rapid UI development, responsive)
- **Socket.io Client** (real-time friend activity)
- **Recharts** (statistics visualization)
- **React Router** (navigation)

### Backend
- **Node.js** + **Express** (RESTful API)
- **MongoDB** + **Mongoose** (flexible document database)
- **Socket.io** (WebSocket for real-time)
- **JWT** (stateless authentication)
- **bcryptjs** (password hashing)
- **Nodemailer** (email service)

---

## 🏗️ Architecture

```
React Frontend (Vite) 
    ↓ HTTP/REST (Axios)
Express Server (Node.js)
    ↓ WebSocket (Socket.io)
MongoDB Database (Atlas)
```

**Data Flow**: User Action → React → Axios → Express → MongoDB → Response → React State → UI Update

---

## ✨ Core Features

1. **Authentication**: Email registration with OTP verification, JWT login
2. **Study Timer**: Real-time tracking with Pomodoro support
3. **Friends System**: Invite codes, live activity feed, real-time notifications
4. **Schedules**: Create recurring study sessions with progress tracking
5. **Statistics**: Weekly charts, subject breakdown, goal tracking
6. **Achievements**: 7 types (first session, streaks, milestones)
7. **Leaderboard**: Global/weekly/monthly rankings
8. **Profile**: Avatar upload, study stats, friend profiles
9. **Dark Mode**: Theme switching with persistence
10. **Real-time**: Socket.io for live friend updates

---

## 🗄️ Database Model

**Single User Model** with embedded documents:
- Basic info (username, email, password, avatar)
- Friends array (ObjectId references)
- Study sessions array (with duration, subject, notes)
- Study schedules array (with recurring, completion tracking)
- Statistics (total/weekly/monthly study time)
- Streaks and achievements
- Goals (daily goal, current streak)

**Key Methods**:
- `addStudySession()` - Adds session, updates stats, checks achievements
- `updateStreak()` - Calculates consecutive study days
- `checkAchievements()` - Validates and awards achievements

---

## 🔌 Key API Endpoints

**Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`
**Study**: `/api/study/session/start`, `/api/study/session/stop`, `/api/study/stats`
**Users**: `/api/users/add-friend`, `/api/users/rankings`, `/api/users/friends`

---

## 🔄 Real-time Features

**Socket.io Events**:
- `start_study` → Broadcasts to friends
- `stop_study` → Notifies friends of completion
- `friend_started_studying` → Real-time notification
- `friend_stopped_studying` → Session completion notification

**Authentication**: JWT token in socket handshake, middleware validates

---

## 🔒 Security

- **Passwords**: bcrypt hashing with salt (10 rounds)
- **JWT**: 7-day expiry, secret in env variables
- **CORS**: Production URL whitelist only
- **Validation**: Input sanitization, session duration limits (1s-24h)
- **File Upload**: Multer with type/size validation
- **Email**: OTP expires in 10 minutes

---

## 🚀 Deployment

**Backend**: Render (Node.js Web Service)
- Root: `backend/`
- Build: `npm install`
- Start: `npm start`
- Env: MongoDB URI, JWT Secret, Email credentials

**Frontend**: Vercel (Static Site)
- Root: `frontend/`
- Build: `npm run build`
- Output: `dist/`
- Env: API URL, Socket URL

**Database**: MongoDB Atlas (Cloud)

---

## 💡 Why This Stack?

1. **MERN Stack**: JavaScript everywhere, faster development
2. **MongoDB**: Flexible schema for evolving user data
3. **Socket.io**: Real-time features with automatic fallbacks
4. **JWT**: Stateless, scalable authentication
5. **Vite**: 10x faster than Create React App
6. **Tailwind**: Rapid UI development, consistent design

---

## 🎯 Key Challenges Solved

1. **Real-time Friend Activity**: Socket.io rooms for efficient broadcasting
2. **Streak Calculation**: Date-based logic handling timezones
3. **Achievement System**: Prevents duplicates, handles errors gracefully
4. **Email Service**: Development mode fallback when credentials missing
5. **File Upload**: Secure storage and serving with Multer

---

## 📊 Project Stats

- **Frontend**: 9 pages, 3 contexts, reusable components
- **Backend**: 3 route files, 1 model, middleware, services
- **Features**: 10 core features, 7 achievement types
- **Real-time**: Socket.io with room-based messaging
- **Security**: JWT auth, bcrypt, CORS, input validation

---

## 🎓 Interview Talking Points

**Technical Decisions**:
- Why MERN? JavaScript everywhere, MongoDB flexibility
- Why Socket.io? Automatic fallbacks, room management
- Why JWT? Stateless, scalable, mobile-ready
- Why Vite? Faster builds, better DX

**Scalability**:
- MongoDB sharding for horizontal scaling
- Socket.io adapter for multiple servers
- Redis caching (future)
- Load balancing (future)

**Best Practices**:
- Environment variables for secrets
- Error handling and logging
- Input validation
- Secure password hashing
- CORS configuration
- File upload security

---

## 🔮 Future Enhancements

- Study groups and video calls
- Mobile app (React Native)
- Push notifications
- Study challenges
- Advanced analytics
- Export data (CSV/PDF)

---

**Quick Demo Flow**:
1. Register → Email OTP → Verify → Login
2. Dashboard → Start Study → Add Subject → Stop
3. Friends → Add by Invite Code → See Live Activity
4. Schedule → Create Session → Track Progress
5. Statistics → View Charts → Check Achievements
6. Rankings → See Leaderboard → Compare with Friends

---

**Made with ❤️ for productive studying**

