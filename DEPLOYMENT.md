# 🚀 StudyBuddy Deployment Checklist

This checklist guides you through deploying the StudyBuddy application to production.

---

## 📋 Pre-Deployment Phase (Do This First!)

### 1. Prepare Your Accounts
- [ ] GitHub account created and repository set up
- [ ] MongoDB Atlas account created (https://www.mongodb.com/cloud/atlas)
- [ ] Render account created (https://render.com) OR Railway account (https://railway.app)
- [ ] Vercel account created (https://vercel.com)
- [ ] Gmail account ready with 2FA enabled (for email OTP)

### 2. Generate Required Credentials

#### Generate JWT Secret
```bash
# Run this command in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] Copy the output - this is your JWT_SECRET
- [ ] Save it somewhere safe (you'll need it later)

#### Generate Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google generates a 16-character password
4. [ ] Copy this - this is your EMAIL_PASS
5. [ ] Save it (you'll need it for backend setup)

#### Get MongoDB Connection String
1. Log in to MongoDB Atlas
2. Click on your cluster
3. Click "Connect" → "Drivers"
4. Copy the connection string
5. [ ] Replace `<username>` with your database username
6. [ ] Replace `<password>` with your database password
7. [ ] Replace `/study-together` in the URL if using different database name
8. [ ] Test the connection locally with MongoDB Compass

### 3. Update Environment Variables

#### In Backend
1. [ ] Create `backend/.env` file (copy from `backend/.env.example`)
2. [ ] Set `NODE_ENV=production`
3. [ ] Set `JWT_SECRET=[your generated secret]`
4. [ ] Set `MONGODB_URI=[your MongoDB connection string]`
5. [ ] Set `EMAIL_USER=[your Gmail]`
6. [ ] Set `EMAIL_PASS=[your Gmail app password]`
7. [ ] Set `FRONTEND_URL=http://localhost:5173` (for now)
8. [ ] Verify `.env` file is in `.gitignore` (it should be)

#### In Frontend
1. [ ] Create `frontend/.env` file (copy from `frontend/.env.example`)
2. [ ] Set `VITE_API_URL=http://localhost:3001/api`
3. [ ] Set `VITE_SOCKET_URL=http://localhost:3001`

### 4. Test Locally First

#### Test Backend
```bash
cd backend
npm install
npm run dev
```
- [ ] Server starts on http://localhost:3001
- [ ] No MongoDB connection errors
- [ ] GET http://localhost:3001/health returns `{ "status": "OK" }`

#### Test Frontend
```bash
cd frontend
npm install
npm run dev
```
- [ ] Frontend loads on http://localhost:5173
- [ ] No console errors
- [ ] Can register/login successfully
- [ ] Can start a study session
- [ ] Can add friends (Socket.io works)

#### Test OTP Email
1. Go to http://localhost:5173/register
2. Enter test email and register
3. [ ] Check email for OTP
4. [ ] OTP is valid
5. [ ] Can complete registration

### 5. Commit Code to Git
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```
- [ ] All files committed
- [ ] No uncommitted changes
- [ ] `.env` file NOT committed (in .gitignore)

---

## 🌐 Deployment Phase (Now Deploy!)

### Option A: Render Backend + Vercel Frontend (Recommended)

#### Step 1: Deploy Backend on Render

1. [ ] Go to https://render.com
2. [ ] Sign in with GitHub account
3. [ ] Click "New +" → "Web Service"
4. [ ] Select your StudyBuddy repository
5. [ ] Configure service:
   - [ ] Name: `studybuddy-backend`
   - [ ] Root Directory: `backend`
   - [ ] Runtime: `Node.js`
   - [ ] Build Command: `npm install`
   - [ ] Start Command: `npm start`

6. [ ] Click "Create Web Service"
7. [ ] Wait for build to complete (5-10 minutes)
8. [ ] Go to "Environment" tab
9. [ ] Add these environment variables:
   - [ ] `NODE_ENV` = `production`
   - [ ] `PORT` = `3001`
   - [ ] `JWT_SECRET` = [your generated secret]
   - [ ] `MONGODB_URI` = [your MongoDB connection string]
   - [ ] `FRONTEND_URL` = `http://localhost:5173` (update later)
   - [ ] `EMAIL_USER` = [your Gmail]
   - [ ] `EMAIL_PASS` = [your Gmail app password]

10. [ ] Save variables (triggers redeploy)
11. [ ] Deployment completes successfully
12. [ ] Copy your Render service URL (e.g., `https://studybuddy-backend.onrender.com`)
13. [ ] Test backend health: visit `https://studybuddy-backend.onrender.com/health`
    - Should return: `{"status":"OK","message":"Server is running"}`

#### Step 2: Deploy Frontend on Vercel

1. [ ] Go to https://vercel.com
2. [ ] Sign in with GitHub account
3. [ ] Click "Add New..." → "Project"
4. [ ] Select your StudyBuddy repository
5. [ ] Configure project:
   - [ ] Framework: `Vite`
   - [ ] Root Directory: `frontend`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

6. [ ] Go to "Environment Variables"
7. [ ] Add these variables:
   - [ ] `VITE_API_URL` = `https://studybuddy-backend.onrender.com/api`
   - [ ] `VITE_SOCKET_URL` = `https://studybuddy-backend.onrender.com`
   
   (Replace with your actual Render URL from Step 1)

8. [ ] Click "Deploy"
9. [ ] Wait for build to complete (3-5 minutes)
10. [ ] Deployment is successful
11. [ ] Copy your Vercel URL (e.g., `https://studybuddy-app.vercel.app`)
12. [ ] Test frontend loads without errors

#### Step 3: Update Backend CORS Configuration

1. [ ] Go back to Render dashboard
2. [ ] Open your backend service
3. [ ] Go to "Environment" tab
4. [ ] Update `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
   (Use the Vercel URL from Step 2)
5. [ ] Save (triggers redeploy)
6. [ ] Wait for backend to redeploy

#### Step 4: Final Testing

1. [ ] Open your Vercel frontend URL in browser
2. [ ] Register new account
3. [ ] [ ] Check email for OTP
4. [ ] [ ] Complete registration
5. [ ] [ ] Login successfully
6. [ ] [ ] Dashboard loads
7. [ ] [ ] Start study session
8. [ ] [ ] Stop study session
9. [ ] [ ] Can see stats and charts
10. [ ] [ ] Open in another tab/browser
11. [ ] [ ] Add first browser as friend
12. [ ] [ ] See online status updates
13. [ ] [ ] Start study session in first tab
14. [ ] [ ] See activity update in second tab (Socket.io working)

---

### Option B: Railway Backend + Vercel Frontend

#### Step 1: Deploy Backend on Railway

1. [ ] Go to https://railway.app
2. [ ] Sign in with GitHub
3. [ ] New Project → Deploy from GitHub repo
4. [ ] Select StudyBuddy repository
5. [ ] Configure:
   - [ ] Root Directory: `backend`
   - [ ] Railway auto-detects Node.js

6. [ ] Go to "Variables" tab
7. [ ] Add same environment variables as Render option
8. [ ] Deployment starts automatically
9. [ ] Wait for completion
10. [ ] Copy Railway service URL from deployment details
11. [ ] Test health endpoint

#### Step 2-3: Same as Render option above

---

## 📧 Email Configuration (Critical!)

### If Emails Not Working:

1. [ ] Verify `EMAIL_USER` is correct Gmail
2. [ ] Verify `EMAIL_PASS` is app password (not Gmail password)
3. [ ] Check Gmail 2FA is enabled
4. [ ] Go to myaccount.google.com/apppasswords
5. [ ] Regenerate app password if needed
6. [ ] Update backend environment variables
7. [ ] Test by registering new account

### Allow Less Secure Apps (if needed):
1. Go to myaccount.google.com/security
2. Turn on "Less secure app access"
3. Try again

---

## 🗄️ Database Configuration

### MongoDB Atlas Setup:

1. [ ] Go to https://www.mongodb.com/cloud/atlas
2. [ ] Create new cluster (M0 Free tier)
3. [ ] Click "Connect"
4. [ ] Choose "Connect from Application"
5. [ ] Select Node.js driver
6. [ ] Copy connection string
7. [ ] Go to "Network Access"
8. [ ] Click "Add IP Address"
9. [ ] For production: Add Render/Railway IP address
    - For development: Can use 0.0.0.0/0 (allow anywhere)
10. [ ] Test connection from backend logs

---

## 🔒 Security Checklist

- [ ] All credentials in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] Different JWT_SECRET for dev/prod
- [ ] MongoDB whitelist configured
- [ ] CORS origins restricted (not allowing all origins)
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] No API keys in error messages
- [ ] No credentials logged to console
- [ ] Database credentials have limited permissions

---

## 🐛 Troubleshooting

### If Frontend Shows Blank Page:
1. [ ] Check browser console (F12) for errors
2. [ ] Verify `VITE_API_URL` is correct
3. [ ] Verify backend is running
4. [ ] Check network tab - API calls should succeed
5. [ ] Clear browser cache and refresh

### If OTP Email Not Arriving:
1. [ ] Check spam folder
2. [ ] Verify `EMAIL_USER` and `EMAIL_PASS` are correct
3. [ ] Check backend logs for email errors
4. [ ] Regenerate Gmail app password
5. [ ] Ensure 2FA is enabled on Gmail

### If Socket.io Not Connecting:
1. [ ] Check `VITE_SOCKET_URL` is correct (no `/api`)
2. [ ] Check backend is running
3. [ ] Verify CORS is configured
4. [ ] Check browser console WebSocket errors
5. [ ] Ensure backend Port 3001 is exposed

### If MongoDB Connection Fails:
1. [ ] Verify `MONGODB_URI` is correct
2. [ ] Check IP whitelist on MongoDB Atlas
3. [ ] Test connection string with MongoDB Compass
4. [ ] Ensure cluster is not paused
5. [ ] Check database user password (% encoded special chars)

### If Build Fails on Vercel:
1. [ ] Check Node.js version (should be ≥18)
2. [ ] Verify all dependencies in `package.json`
3. [ ] Check for TypeScript errors
4. [ ] Verify build command is correct
5. [ ] Check logs in Vercel dashboard

---

## 📊 Post-Deployment Monitoring

### Set Up Alerts:
- [ ] Render: Enable deployment notifications
- [ ] Vercel: Enable email notifications
- [ ] MongoDB Atlas: Set up activity alerts

### Monitor Performance:
- [ ] Check Render CPU/Memory usage
- [ ] Check Vercel build times
- [ ] Monitor MongoDB storage (free tier has 512MB limit)
- [ ] Set up error tracking (optional: Sentry)

### Regular Maintenance:
- [ ] Update dependencies monthly
  ```bash
  npm outdated
  npm update
  ```
- [ ] Review error logs weekly
- [ ] Monitor database storage usage
- [ ] Test email functionality regularly

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Can register and receive OTP email
- ✅ Can login successfully
- ✅ Dashboard displays correctly
- ✅ Study timer starts and stops
- ✅ Socket.io connection works (real-time features)
- ✅ Can add and see friends
- ✅ Statistics load correctly
- ✅ No errors in browser console
- ✅ No errors in backend logs

---

## 📞 Need Help?

- Check README.md for deployment options
- Review Troubleshooting section above
- Check backend logs on Render/Railway
- Check frontend logs in browser console (F12)
- Check MongoDB Atlas cluster status
- Verify all environment variables are set

**Congratulations on deploying StudyBuddy!** 🎉
