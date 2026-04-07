# Quick Start Guide for Cecilia

## Step-by-Step Instructions to Run the Application

### Prerequisites Check
1. Make sure Node.js is installed (v14 or higher)
2. Make sure MongoDB is installed and running

### Step 1: Start MongoDB
Make sure MongoDB is running on your system. If you have MongoDB installed:
```bash
# Windows (if MongoDB is installed as a service, it should auto-start)
# Otherwise, start it manually:
mongod
```

### Step 2: Setup Backend

Open a terminal in the **backend** folder:

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

You should see: `Server running in development mode on port 5000`
And: `MongoDB Connected: localhost`

### Step 3: Setup Frontend

Open a **NEW terminal** in the **frontend** folder:

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

You should see: `Local: http://localhost:3000/`

### Step 4: Access the Application

Open your browser and go to: **http://localhost:3000**

### Step 5: Login

Use these demo credentials:

**For Admin Dashboard:**
- Email: `admin@cecilia.com`
- Password: `admin123`

**For Employee Dashboard:**
- Email: `jane@cecilia.com`
- Password: `employee123`

## What You'll See

### Admin Dashboard
- Sales Today, Profit, Total Stock, Low Stock alerts, Active Workers
- Sales trend charts (30 days)
- Profit trend charts
- Quick action buttons

### Features to Explore
1. **Inventory** - View, add, edit, delete clothing items
2. **Sales** - Record new sales, view sales history
3. **Expenses** - Track shop expenses (Admin only)
4. **Workers** - Manage employees and view performance (Admin only)
5. **Reports** - View analytics, profit/loss, best sellers (Admin only)
6. **Profile** - Update your account information

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the MONGO_URI in `backend/.env` file
- Default: `mongodb://localhost:27017/cecilia_shop`

### Port Already in Use
- Backend (5000): Change PORT in `backend/.env`
- Frontend (3000): Change port in `frontend/vite.config.js`

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend Can't Connect to Backend
- Make sure backend is running on port 5000
- Check browser console for errors
- The frontend proxy is configured to forward `/api` requests to `http://localhost:5000`

## Stopping the Application

- Press `Ctrl + C` in both terminal windows (backend and frontend)

## Reset Database

If you want to reset and reseed the database:
```bash
cd backend
npm run seed
```

This will clear all data and add fresh sample data.

## Testing the Application

1. **Login as Admin** - Explore all features
2. **Add new inventory items** - Go to Inventory > Add Item
3. **Record a sale** - Go to Sales > Record Sale
4. **Add an expense** - Go to Expenses > Add Expense
5. **Add a worker** - Go to Workers > Add Worker
6. **View reports** - Go to Reports to see analytics
7. **Login as Employee** - Logout and login with employee credentials
8. **Test role restrictions** - Employees can't access admin-only features

## Mobile Testing

The application is fully responsive! To test on mobile:
1. Both devices must be on the same network
2. Find your computer's IP address (e.g., 192.168.1.100)
3. On mobile, access: `http://YOUR_IP:3000`

Enjoy using Cecilia! 👗✨
