# RewardX - Employee Reward Management System

A premium MERN stack application for managing employee rewards, performance, and recognition.

## Project Structure

```
RewardX/
├── server/                 # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── rewardController.js
│   │   ├── attendanceController.js
│   │   ├── performanceController.js
│   │   ├── feedbackController.js
│   │   └── badgeController.js
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Reward.js
│   │   ├── Attendance.js
│   │   ├── Performance.js
│   │   ├── Feedback.js
│   │   └── Badge.js
│   ├── routes/            # API endpoints
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── rewardRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── performanceRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── badgeRoutes.js
│   ├── middleware/        # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   └── package.json
│
├── client/                 # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── RecentActivity.jsx
│   │   │   │   └── LeaderboardCard.jsx
│   │   │   └── charts/
│   │   │       ├── PerformanceChart.jsx
│   │   │       ├── AttendanceHeatmap.jsx
│   │   │       └── RewardDistributionChart.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── ManagerDashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── RewardsStore.jsx
│   │   │   ├── FeedbackPortal.jsx
│   │   │   ├── AIInsights.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── RewardContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useFetch.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore
├── package.json           # Root package with concurrently scripts
└── README.md
```

## Features

### Employee Features
- **Dashboard**: Overview of rewards, badges, and performance metrics
- **Leaderboard**: Company-wide ranking based on reward points
- **Rewards Store**: Redeem accumulated points for rewards
- **Feedback Portal**: Submit and receive feedback from colleagues
- **AI Insights**: Data-driven performance insights and recommendations
- **Profile**: Manage personal information and view achievements

### Manager Features
- **Manager Dashboard**: Team overview and key metrics
- **Reward Management**: Award points and recognition to team members
- **Performance Reviews**: Manage and track team performance
- **Attendance Tracking**: Monitor team attendance patterns
- **Team Leaderboard**: View top performers in the team

## Tech Stack

### Backend
- **Node.js & Express**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin requests
- **dotenv**: Environment management

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **React Icons**: Icon library
- **Framer Motion**: Animation library

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RewardX
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**
   
   Create or update `server/.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/rewardx
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start the application**
   
   Development mode (runs both server and client):
   ```bash
   npm run dev
   ```
   
   The server will run on `http://localhost:5000`
   The client will run on `http://localhost:3000`

## Available Scripts

### Root Level
- `npm run install-all` - Install dependencies for all packages
- `npm run dev` - Run both server and client concurrently in development mode
- `npm run dev:server` - Run only the server in development mode
- `npm run dev:client` - Run only the client in development mode
- `npm run build` - Build the client for production
- `npm run start:server` - Start the production server

### Server Scripts
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)

### Client Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Rewards
- `POST /api/rewards` - Create reward
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/employee/:employeeId` - Get employee rewards
- `DELETE /api/rewards/:id` - Delete reward

### Attendance
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/employee/:employeeId` - Get employee attendance
- `GET /api/attendance/report` - Get attendance report

### Performance
- `POST /api/performance` - Create performance review
- `GET /api/performance` - Get all reviews
- `GET /api/performance/employee/:employeeId` - Get employee reviews
- `PUT /api/performance/:id` - Update review

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/employee/:employeeId` - Get employee feedback

### Badges
- `POST /api/badges` - Create badge
- `GET /api/badges` - Get all badges
- `POST /api/badges/award` - Award badge to employee
- `DELETE /api/badges/:id` - Delete badge

## Development Notes

### Adding New Features

1. **Backend**:
   - Create model in `server/models/`
   - Create controller in `server/controllers/`
   - Create routes in `server/routes/`
   - Update `server.js` to use new routes

2. **Frontend**:
   - Create component(s) in `src/components/`
   - Create page in `src/pages/` if needed
   - Add route in `src/App.jsx`
   - Update context if needed

### Best Practices

- Keep components small and reusable
- Use custom hooks for logic abstraction
- Handle errors gracefully
- Add loading states
- Validate input data
- Use environment variables for configuration
- Document your code

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
