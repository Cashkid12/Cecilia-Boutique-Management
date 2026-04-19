# Deployment Guide - Cecilia Boutique Management

This guide covers deploying the Cecilia Boutique Management application to production.

## 📋 Deployment Overview

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render
- **Database**: MongoDB Atlas

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "Cecilia Boutique")

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (closest to your users)
4. Click "Create Cluster"

### 3. Configure Security
1. **Database Access**:
   - Click "Database Access" in left sidebar
   - Add a new database user
   - Choose "Password" authentication
   - Create username and strong password
   - Grant "Read and write to any database" privilege
   - Save credentials

2. **Network Access**:
   - Click "Network Access" in left sidebar
   - Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm (for development; restrict in production)

### 4. Get Connection String
1. Click "Clusters" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Replace `/?retryWrites` with `/cecilia-boutique?retryWrites`

## 🖥️ Backend Deployment (Render)

### 1. Prepare Backend

1. **Update Environment Variables** in `backend/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cecilia-boutique
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=30d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=https://cecilia-boutique.vercel.app
   ```

2. **Test Locally**:
   ```bash
   cd backend
   npm install
   npm start
   ```

### 2. Deploy to Render

1. **Create Render Account**:
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `cecilia-boutique-api`
     - **Region**: Choose closest to users
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRE`: `30d`
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USER`: Your email
   - `EMAIL_PASS`: Your email password
   - `FRONTEND_URL`: Your Vercel URL (will add later)

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://cecilia-boutique-api.onrender.com`

### 3. Verify Backend
- Visit: `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status": "OK"}`

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. **Update Environment Variables** in `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Test Production Build Locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

### 2. Deploy to Vercel

1. **Create Vercel Account**:
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
   - Click "Add"

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Copy your frontend URL: `https://cecilia-boutique.vercel.app`

### 3. Update Backend CORS

1. Go back to Render
2. Open your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://cecilia-boutique.vercel.app
   ```
5. Click "Save Changes"
6. Wait for redeployment

## 🔧 Post-Deployment Configuration

### 1. Update PWA Manifest

In `frontend/public/manifest.json`, ensure URLs are correct:
```json
{
  "start_url": "/",
  "scope": "/"
}
```

### 2. Seed Database (Optional)

Run seeder script locally with production MongoDB URI:
```bash
cd backend
# Update .env with production MONGO_URI
node seeder.js
```

### 3. Test All Features

- [ ] Login/Registration
- [ ] Dashboard loading
- [ ] Inventory CRUD
- [ ] Sales recording
- [ ] Expense tracking
- [ ] Worker management
- [ ] Settings page
- [ ] PWA installation
- [ ] Mobile responsiveness

## 🚀 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Vercel: Automatically deploys frontend (~2 min)
   - Render: Automatically deploys backend (~5 min)

3. **Monitor Builds**:
   - Vercel: Check dashboard at vercel.com
   - Render: Check dashboard at render.com

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to Git
- Use strong JWT secrets (min 32 characters)
- Rotate secrets regularly

### 2. Database Security
- Restrict IP addresses in MongoDB Atlas
- Use strong database passwords
- Enable MongoDB Atlas backup

### 3. API Security
- CORS is configured for your frontend URL only
- JWT tokens expire after 30 days
- Passwords are hashed with bcrypt

### 4. Email Security
- Use App Passwords for Gmail (not regular password)
- Enable 2FA on email account
- Consider using SendGrid or AWS SES for production

## 📊 Monitoring

### Backend (Render)
- View logs in Render dashboard
- Monitor CPU and memory usage
- Set up alerts for downtime

### Frontend (Vercel)
- View analytics in Vercel dashboard
- Monitor page load times
- Check deployment logs

### Database (MongoDB Atlas)
- Monitor query performance
- Track storage usage
- Set up backup schedules

## 🐛 Troubleshooting

### Backend Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Test MongoDB connection string locally

### Frontend Build Fails
- Check Vercel build logs
- Verify `VITE_API_URL` is set
- Run `npm run build` locally to test

### CORS Errors
- Ensure `FRONTEND_URL` is set in backend
- Check that frontend URL matches exactly
- Verify backend CORS configuration in `server.js`

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

### PWA Not Installing
- Must be served over HTTPS
- Check `manifest.json` is accessible
- Verify service worker is registered

## 💰 Cost Estimate

### Free Tier (Development)
- **MongoDB Atlas**: Free (512MB storage)
- **Render**: Free (750 hours/month)
- **Vercel**: Free (100GB bandwidth)
- **Total**: $0/month

### Production Tier
- **MongoDB Atlas**: $9+/month (M10 cluster)
- **Render**: $7+/month (Starter plan)
- **Vercel**: $20/month (Pro plan)
- **Total**: ~$36+/month

## 📞 Support

If you encounter issues:
1. Check logs in Vercel/Render dashboards
2. Review this deployment guide
3. Check the main README.md
4. Open an issue on GitHub

---

**Deployment Complete!** 🎉

Your Cecilia Boutique Management app is now live and accessible worldwide!
