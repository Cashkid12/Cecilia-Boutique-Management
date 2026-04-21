const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: ['https://cecilia-boutique.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  if (userId) {
    // Join user's private room
    socket.join(`user:${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} connected via WebSocket`);
  }

  // Handle disconnect
  socket.on('disconnect', () => {
    if (userId) {
      connectedUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    }
  });
});

// Make io accessible to routes and services
app.set('io', io);

// Export function to send notifications
exports.sendNotificationToUser = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

exports.getConnectedUsers = () => connectedUsers;

// Route files
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const workerRoutes = require('./routes/workerRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Middleware
app.use(cors({
  origin: ['https://cecilia-boutique.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', categoryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Cecilia Shop Management API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

// Initialize cron jobs
require('./utils/cronJobs');