# 🚀 Quick Deployment Reference

A fast reference guide for deploying StudyBuddy. Use this alongside DEPLOYMENT.md.

---

## 📋 Files to Configure

### Backend
```
backend/
├── .env                    ← CREATE THIS (never commit)
├── .env.example           ← TEMPLATE PROVIDED ✅
├── package.json           ← Already configured ✅
└── index.js              ← Already configured ✅
```

### Frontend
```
frontend/
├── .env                    ← CREATE THIS (Vercel will override)
├── .env.example           ← TEMPLATE PROVIDED ✅
├── package.json           ← Already configured ✅
├── vite.config.js         ← Already configured ✅
└── src/
    ├── contexts/
    │   ├── AuthContext.jsx     ← Already uses VITE_API_URL ✅
    │   └── SocketContext.jsx   ← Already uses VITE_SOCKET_URL ✅
    └── ... (rest configured)
```

---

## ⚙️ Environment Variables at a Glance

### Backend (.env)
```
NODE_ENV=production
PORT=3001
JWT_SECRET=<32-char cryptographic secret>
MONGODB_URI=<MongoDB Atlas connection string>
FRONTEND_URL=<Vercel app URL>
EMAIL_USER=<your Gmail>
EMAIL_PASS=<16-char Gmail app password>
```

### Frontend (.env or Vercel)
```
VITE_API_URL=https://<backend>.onrender.com/api
VITE_SOCKET_URL=https://<backend>.onrender.com
```

---

## 🔄 Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. SET UP ACCOUNTS & CREDENTIALS                        │
│    └─ GitHub, MongoDB Atlas, Render, Vercel            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. GENERATE SECRETS                                     │
│    └─ JWT_SECRET, Gmail App Password                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CONFIGURE MONGODB ATLAS                              │
│    └─ Create cluster, user, whitelist IPs              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. CREATE .env FILES                                    │
│    └─ Backend: .env with all variables                 │
│    └─ Frontend: .env.local (optional for local test)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. TEST LOCALLY                                         │
│    └─ Start backend: npm run dev (from backend/)        │
│    └─ Start frontend: npm run dev (from frontend/)      │
│    └─ Test: register, OTP email, login, study timer   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. PUSH TO GITHUB                                       │
│    └─ git add . && git commit && git push              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. DEPLOY BACKEND (Render or Railway)                  │
│    └─ Connect GitHub repo                              │
│    └─ Set environment variables                        │
│    └─ Get deployment URL                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 8. DEPLOY FRONTEND (Vercel)                             │
│    └─ Connect GitHub repo                              │
│    └─ Set environment variables (with backend URL)     │
│    └─ Get deployment URL                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 9. UPDATE BACKEND CORS                                  │
│    └─ Update FRONTEND_URL to Vercel URL                │
│    └─ Backend redeploys automatically                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 10. TEST IN PRODUCTION                                  │
│     └─ Register account                                │
│     └─ Verify OTP email                                │
│     └─ Test all features                               │
│     └─ Check real-time updates (Socket.io)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ✅ DEPLOYMENT COMPLETE!                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Step-by-Step Commands

### 1. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
👉 Save the output

### 2. Get Gmail App Password
1. Enable 2FA on Gmail
2. Go to myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. 👉 Copy the 16-character password

### 3. Get MongoDB Connection String
1. Log in to MongoDB Atlas
2. Go to your cluster
3. Click "Connect" → "Drivers"
4. 👉 Copy connection string
5. Replace `<username>` and `<password>`

### 4. Create Backend .env
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### 5. Test Backend Locally
```bash
cd backend
npm install
npm run dev
# Should see: Server running on port 3001
```

### 6. Create Frontend .env
```bash
cd frontend
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
EOF
```

### 7. Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
# Should see: running at http://localhost:5173
```

### 8. Push to GitHub
```bash
git add .
git commit -m "Deployment ready"
git push origin main
```

### 9. Create Render Service
- Go to render.com
- New Web Service
- Connect GitHub repo
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Add environment variables
- Deploy

### 10. Create Vercel Project
- Go to vercel.com
- Add Project
- Select GitHub repo
- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Add environment variables (with Render backend URL)
- Deploy

---

## 🔍 Verification Checklist

### Backend Health
```bash
curl https://<backend-url>.onrender.com/health
# Should return: {"status":"OK","message":"Server is running"}
```

### Frontend Loading
- Open https://<frontend-url>.vercel.app in browser
- Should load without errors

### OTP Email
- Register new account
- Check email for OTP
- Should arrive within 1 minute

### Socket.io Connection
- Open browser console (F12)
- Should see "Connected to server"
- No WebSocket errors

### Study Features
- Start study timer
- Check real-time updates
- Add friends
- See online status

---

## 🚨 Common Issues

| Issue | Fix |
|-------|-----|
| **Frontend blank page** | Check `VITE_API_URL` in Vercel env vars, verify backend is running |
| **OTP not arriving** | Check `EMAIL_USER`/`EMAIL_PASS`, regenerate Gmail app password |
| **Socket.io not connecting** | Check `VITE_SOCKET_URL` (should NOT include `/api`), verify CORS |
| **MongoDB error** | Check connection string, verify IP whitelist, test with Compass |
| **Build fails on Vercel** | Check Node.js version ≥18, verify all dependencies, check build logs |

---

## 📚 Full Documentation

For detailed instructions, see:
- **DEPLOYMENT.md** - Complete step-by-step guide
- **README.md** - Project overview and features
- **backend/.env.example** - Backend variables explained
- **frontend/.env.example** - Frontend variables explained

---

## 💡 Pro Tips

1. **Use different secrets for dev/prod**
   - Don't use same JWT_SECRET everywhere

2. **Test locally before deploying**
   - Catches issues early

3. **Monitor logs after deployment**
   - Render: Service dashboard → Logs
   - Vercel: Deployment details → Functions logs

4. **Keep credentials secure**
   - Never commit .env files
   - Use deployment platform env var interfaces
   - Rotate secrets periodically

5. **Set up alerts**
   - Enable notifications on Render/Vercel
   - Monitor deployment failures

---

**Last Updated:** January 2026
**StudyBuddy Version:** 1.0.0
