# DEPLOYMENT GUIDE - Cecilia Boutique Management

## Overview
- **Backend**: Deploy to Render (Free tier)
- **Frontend**: Deploy to Vercel (Free tier)
- **Database**: MongoDB Atlas (Free tier - already set up)

**Order: Backend FIRST, then Frontend**

---

## PHASE 1: Deploy Backend to Render

### Step 1: Push Code to GitHub
✅ Already done! Your code is at: https://github.com/Cashkid12/Cecilia-Boutique-Management

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Connect your GitHub account

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `Cecilia-Boutique-Management`
3. Configure:
   - **Name**: `cecilia-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### Step 4: Add Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://cashmid:zD38W3aE1vG01IR@cluster0.u4oi3eo.mongodb.net/cecilia?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=cecilia_super_secret_jwt_key_2024_secure
JWT_EXPIRE=7d
PORT=5000
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Copy your backend URL (e.g., `https://cecilia-backend.onrender.com`)

### Step 6: Test Backend
Open in browser: `https://your-backend-url.onrender.com/api/health`
Should return: `{"success": true, "message": "Server is running"}`

---

## PHASE 2: Update Frontend with Backend URL

### Step 1: Update API Configuration
Edit `frontend/src/utils/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
```

Replace `your-backend-url.onrender.com` with your actual Render URL.

### Step 2: Create Frontend .env
Create `frontend/.env.production`:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## PHASE 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import: `Cecilia-Boutique-Management`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### Step 3: Add Environment Variable
In Vercel dashboard:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-url.onrender.com/api`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. Your app is live at: `https://cecilia-boutique.vercel.app`

---

## PHASE 4: Update CORS (Backend)

After frontend is deployed, update CORS in `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://cecilia-boutique.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

Or use your actual Vercel URL.

---

## Environment Variables Summary

### Backend (Render):
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Post-Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] Frontend deployed and loads correctly
- [ ] Can register admin account
- [ ] Can login successfully
- [ ] All API calls work (check browser console)
- [ ] CORS configured correctly

---

## Troubleshooting

### Backend Issues:
- Check Render logs in dashboard
- Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0)
- Ensure all environment variables are set

### Frontend Issues:
- Check Vercel deployment logs
- Verify `VITE_API_URL` is correct
- Check browser console for CORS errors
- Clear browser cache

### Common Errors:
- **CORS Error**: Update backend CORS with frontend URL
- **500 Error**: Check backend logs on Render
- **Network Error**: Verify backend URL in frontend
- **MongoDB Connection**: Check IP whitelist on Atlas

---

## Free Tier Limitations

### Render (Free):
- Service sleeps after 15 min inactivity
- Takes ~30 seconds to wake up
- 750 hours/month (always enough for 1 service)

### Vercel (Free):
- 100 GB bandwidth/month
- Automatic HTTPS
- Custom domains supported

### MongoDB Atlas (Free):
- 512 MB storage
- Shared RAM
- Enough for thousands of products

---

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render:
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## Next Steps After Deployment

1. Register your admin account
2. Create employee accounts
3. Add inventory items
4. Start tracking sales!

---

## Support

If you encounter issues:
1. Check deployment logs (Render/Vercel dashboard)
2. Check browser console for errors
3. Verify all environment variables
4. Test backend health endpoint
