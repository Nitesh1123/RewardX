import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Decode token to get role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Wrong role — redirect to correct dashboard
      if (userRole === 'employee') {
        return <Navigate to="/dashboard" replace />
      } else {
        return <Navigate to="/manager" replace />
      }
    }
    
    return <Outlet />
  } catch (err) {
    // Invalid token — clear and redirect
    localStorage.clear()
    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute
