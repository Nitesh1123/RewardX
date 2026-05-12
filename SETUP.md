# RewardX - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ installed
- npm or yarn package manager
- MongoDB running locally or a MongoDB Atlas connection string

### Step 1: Navigate to Project Root
```bash
cd path/to/RewardX
```

### Step 2: Install Dependencies
```bash
npm run install-all
```
This installs packages for root, server, and client.

### Step 3: Configure Environment Variables

**For Server (`server/.env`):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/rewardx
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

If using MongoDB Atlas, replace MONGO_URI with your connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rewardx?retryWrites=true&w=majority
```

### Step 4: Start the Application

**Development Mode (Both Server & Client):**
```bash
npm run dev
```

**Individual Services:**
```bash
# Terminal 1 - Start Server
npm run dev:server

# Terminal 2 - Start Client
npm run dev:client
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 📚 Project Structure

### Backend (`/server`)
- **config/** - Database connection setup
- **controllers/** - Business logic for each feature
- **models/** - MongoDB schemas
- **routes/** - API endpoints
- **middleware/** - Auth and error handling
- **server.js** - Main application entry point

### Frontend (`/client`)
- **src/components/** - Reusable React components
- **src/pages/** - Full page components
- **src/context/** - React Context for state management
- **src/hooks/** - Custom React hooks
- **src/utils/** - Helper functions and API client
- **src/styles/** - Global CSS with Tailwind

## 🔑 Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both server and client concurrently |
| `npm run dev:server` | Run only backend server |
| `npm run dev:client` | Run only frontend client |
| `npm run build` | Build frontend for production |
| `npm start:server` | Start production server |

## 🔐 Default Test Credentials

You can create test users via the registration page or API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "employee"
  }'
```

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "secure123",
    "role": "manager"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Employees
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Reward
```bash
curl -X POST http://localhost:5000/api/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "employeeId": "USER_ID",
    "points": 100,
    "reason": "Great performance",
    "category": "performance"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check if MONGO_URI is correct in `.env`
- For MongoDB Atlas, verify IP whitelist and connection string

### Port Already in Use
- Server (5000): `npx kill-port 5000`
- Client (3000): `npx kill-port 3000`

### Dependencies Issue
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm run install-all`

### CORS Error
- Ensure server is running on http://localhost:5000
- Check CORS configuration in `server/server.js`

## 📦 Project Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ORM
- jsonwebtoken - JWT auth
- bcryptjs - Password hashing
- cors - Cross-origin support
- dotenv - Environment variables

### Frontend
- react - UI library
- vite - Build tool
- react-router-dom - Routing
- tailwindcss - CSS framework
- axios - HTTP client
- recharts - Charts
- react-icons - Icons
- framer-motion - Animations

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update `JWT_SECRET` with a strong secret
3. Set `MONGO_URI` to production database
4. Deploy to services like Heroku, Railway, or AWS

### Frontend Deployment
1. Run: `npm run build`
2. Deploy `dist/` folder to Vercel, Netlify, or AWS S3

## 📞 Support & Documentation

- Backend Swagger/API Docs: (Add when implemented)
- Component Documentation: Check individual component files
- Database Schema: See `server/models/`

## 📄 License

ISC

---
**Last Updated**: May 2026
**Version**: 1.0.0
