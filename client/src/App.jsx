import { BrowserRouter, Routes, Route, Navigate } 
  from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import Leaderboard from './pages/Leaderboard'
import RewardsStore from './pages/RewardsStore'
import FeedbackPortal from './pages/FeedbackPortal'
import AIInsights from './pages/AIInsights'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D0D18',
              color: '#F8F8FF',
              border: '1px solid rgba(245,158,11,0.3)',
            }
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" 
                element={<EmployeeDashboard />} />
              <Route path="/manager" 
                element={<ManagerDashboard />} />
              <Route path="/leaderboard" 
                element={<Leaderboard />} />
              <Route path="/rewards" 
                element={<RewardsStore />} />
              <Route path="/feedback" 
                element={<FeedbackPortal />} />
              <Route path="/ai-insights" 
                element={<AIInsights />} />
              <Route path="/profile" 
                element={<Profile />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" 
            element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
