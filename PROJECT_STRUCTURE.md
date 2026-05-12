# RewardX Project Structure

```
RewardX/
│
├── 📦 root                                 # Root configuration
│   ├── package.json                        # Scripts for concurrent development
│   ├── .gitignore                          # Git ignore rules
│   ├── README.md                           # Main documentation
│   ├── SETUP.md                            # Setup & quick start guide
│   └── PROJECT_STRUCTURE.md                # This file
│
├── 🖥️ server/                              # Backend (Node.js + Express + MongoDB)
│   │
│   ├── config/
│   │   └── db.js                           # MongoDB connection configuration
│   │
│   ├── controllers/                        # Business logic layer
│   │   ├── authController.js               # Authentication logic (register, login, logout)
│   │   ├── employeeController.js           # Employee management (CRUD)
│   │   ├── rewardController.js             # Reward management
│   │   ├── attendanceController.js         # Attendance tracking
│   │   ├── performanceController.js        # Performance reviews
│   │   ├── feedbackController.js           # Feedback management
│   │   └── badgeController.js              # Badge/achievement management
│   │
│   ├── models/                             # MongoDB Schemas (Mongoose)
│   │   ├── User.js                         # User schema (employees, managers, admins)
│   │   ├── Reward.js                       # Reward schema
│   │   ├── Attendance.js                   # Attendance tracking schema
│   │   ├── Performance.js                  # Performance review schema
│   │   ├── Feedback.js                     # Feedback schema
│   │   └── Badge.js                        # Badge/achievement schema
│   │
│   ├── routes/                             # API Route definitions
│   │   ├── authRoutes.js                   # Auth endpoints
│   │   ├── employeeRoutes.js               # Employee endpoints
│   │   ├── rewardRoutes.js                 # Reward endpoints
│   │   ├── attendanceRoutes.js             # Attendance endpoints
│   │   ├── performanceRoutes.js            # Performance endpoints
│   │   ├── feedbackRoutes.js               # Feedback endpoints
│   │   └── badgeRoutes.js                  # Badge endpoints
│   │
│   ├── middleware/                         # Custom middleware
│   │   ├── authMiddleware.js               # JWT authentication middleware
│   │   └── errorMiddleware.js              # Global error handling
│   │
│   ├── server.js                           # Main server entry point
│   ├── package.json                        # Backend dependencies
│   ├── .env                                # Environment variables (local)
│   └── .env.example                        # Example environment variables
│
├── 💻 client/                              # Frontend (React + Vite + Tailwind)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx              # Top navigation bar
│   │   │   │   ├── Sidebar.jsx             # Side navigation menu
│   │   │   │   ├── LoadingSpinner.jsx      # Loading indicator
│   │   │   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx            # Statistics display card
│   │   │   │   ├── RecentActivity.jsx      # Activity feed component
│   │   │   │   └── LeaderboardCard.jsx     # Leaderboard entry card
│   │   │   │
│   │   │   └── charts/
│   │   │       ├── PerformanceChart.jsx    # Line chart for performance
│   │   │       ├── AttendanceHeatmap.jsx   # Scatter chart for attendance
│   │   │       └── RewardDistributionChart.jsx # Pie chart for rewards
│   │   │
│   │   ├── pages/                          # Full page components
│   │   │   ├── Login.jsx                   # Login/authentication page
│   │   │   ├── EmployeeDashboard.jsx       # Employee dashboard
│   │   │   ├── ManagerDashboard.jsx        # Manager dashboard
│   │   │   ├── Leaderboard.jsx             # Company leaderboard
│   │   │   ├── RewardsStore.jsx            # Rewards redemption store
│   │   │   ├── FeedbackPortal.jsx          # Feedback submission & view
│   │   │   ├── AIInsights.jsx              # AI-powered insights & analytics
│   │   │   └── Profile.jsx                 # User profile management
│   │   │
│   │   ├── context/                        # React Context (State Management)
│   │   │   ├── AuthContext.jsx             # Authentication context
│   │   │   └── RewardContext.jsx           # Reward management context
│   │   │
│   │   ├── hooks/                          # Custom React hooks
│   │   │   ├── useAuth.js                  # Hook for auth context
│   │   │   └── useFetch.js                 # Hook for data fetching
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js                      # Axios API client setup
│   │   │   └── constants.js                # Application constants & enums
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css                 # Global CSS & Tailwind setup
│   │   │
│   │   ├── assets/                         # Images, icons, media
│   │   │
│   │   ├── App.jsx                         # Main App component & routing
│   │   └── main.jsx                        # React entry point
│   │
│   ├── public/                             # Static files
│   │
│   ├── index.html                          # HTML template
│   ├── vite.config.js                      # Vite configuration
│   ├── tailwind.config.js                  # Tailwind CSS configuration
│   ├── postcss.config.js                   # PostCSS configuration
│   └── package.json                        # Frontend dependencies
│
└── 📋 Root Files
    ├── package.json                        # Root package with concurrently
    ├── .gitignore                          # Git ignore patterns
    ├── README.md                           # Project documentation
    └── SETUP.md                            # Quick start guide
```

## 📊 Key Architectural Components

### Backend Architecture
```
Request → Middleware (Auth/Error) → Routes → Controllers → Models → Database
           ↓
           Response
```

### Frontend Architecture
```
User Interface
      ↓
   Components
      ↓
   Context/Hooks
      ↓
   API Client (axios)
      ↓
   Backend API
```

## 🔄 Data Flow Examples

### Authentication Flow
1. User enters credentials on Login page
2. Login page sends credentials to `/api/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token added to Authorization header for all requests

### Reward Awarding Flow
1. Manager accesses Manager Dashboard
2. Views employees and reward options
3. Submits reward via `POST /api/rewards`
4. Backend creates reward record
5. Employee sees reward in dashboard
6. Points added to employee profile

## 📦 Dependencies Overview

### Backend (Server)
| Package | Purpose | Version |
|---------|---------|---------|
| express | Web framework | ^4.18.2 |
| mongoose | MongoDB ORM | ^7.0.3 |
| jsonwebtoken | JWT authentication | ^9.0.0 |
| bcryptjs | Password hashing | ^2.4.3 |
| cors | Cross-origin requests | ^2.8.5 |
| dotenv | Environment variables | ^16.0.3 |

### Frontend (Client)
| Package | Purpose | Version |
|---------|---------|---------|
| react | UI library | ^18.2.0 |
| react-dom | DOM rendering | ^18.2.0 |
| react-router-dom | Client routing | ^6.9.0 |
| vite | Build tool | ^4.2.0 |
| tailwindcss | CSS framework | ^3.2.7 |
| axios | HTTP client | ^1.3.4 |
| recharts | Chart library | ^2.6.2 |
| react-icons | Icon library | ^4.8.0 |
| framer-motion | Animation library | ^10.0.0 |

## 🚀 Development Workflow

### Adding a New Feature

#### Backend:
1. Create model in `server/models/`
2. Create controller in `server/controllers/`
3. Create routes in `server/routes/`
4. Register routes in `server/server.js`
5. Test with Postman or cURL

#### Frontend:
1. Create component(s) in appropriate folder
2. Create page if needed
3. Add route in `App.jsx`
4. Update context if needed
5. Import and use in components

## 🗂️ File Naming Conventions

- **Components**: PascalCase + .jsx (e.g., `StatCard.jsx`)
- **Hooks**: camelCase + .js (e.g., `useAuth.js`)
- **Utils**: camelCase + .js (e.g., `api.js`)
- **Models**: PascalCase + .js (e.g., `User.js`)
- **Controllers**: camelCase + .js (e.g., `authController.js`)
- **Routes**: camelCase + .js (e.g., `authRoutes.js`)

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcryptjs for secure passwords
3. **CORS Protection** - Controlled cross-origin access
4. **Protected Routes** - Frontend route protection wrapper
5. **Authorization Middleware** - Server-side route protection
6. **Environment Variables** - Sensitive data not exposed

## 📈 Scalability Considerations

1. **Database Indexing** - Add indexes to frequently queried fields
2. **API Pagination** - Implement pagination for large datasets
3. **Caching** - Redis for performance optimization
4. **Rate Limiting** - Prevent abuse and DDoS
5. **Load Balancing** - Distribute traffic across servers
6. **Microservices** - Separate concerns into services

## 🧪 Testing Structure (To Be Implemented)

```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── integration/
│   └── routes/
└── e2e/
    └── pages/
```

---
**Project Setup Date**: May 2026
**MERN Stack Version**: 1.0.0
