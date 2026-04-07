# Cecilia Boutique Management

A professional clothing shop management web application built with React.js, Tailwind CSS, Node.js, Express, and MongoDB.

## Features

- **Role-Based Authentication**: Admin and Employee roles with different access levels
- **Dashboard Analytics**: Real-time sales, inventory, and performance metrics
- **Inventory Management**: Track stock, pricing, and low stock alerts
- **Sales Tracking**: Record sales, track profits, and generate receipts
- **Expense Management**: Monitor business costs and operational spending
- **Worker Management**: Employee performance tracking and account management
- **Reports & Analytics**: Comprehensive profit/loss reports with charts
- **Settings & Profile**: Customizable themes (Light, Dark, Beige)

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts
- Lucide React Icons
- React Hot Toast
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/Cashkid12/Cecilia-Boutique-Management.git
cd Cecilia-Boutique-Management
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in the backend folder
- Add your MongoDB connection string and JWT secret

5. Start the backend server
```bash
cd backend
npm start
```

6. Start the frontend development server
```bash
cd frontend
npm run dev
```

## Usage

- Access the app at `http://localhost:5173`
- First-time setup: Create an admin account
- Admin can create employee accounts
- Employees can only access their own dashboard and sales

## Project Structure

```
Cecilia-Boutique-Management/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── index.html
└── README.md
```

## License

MIT License

## Author

Cecilia Boutique Management System
