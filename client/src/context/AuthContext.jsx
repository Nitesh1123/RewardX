import { createContext, useContext, useState, 
  useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(
    localStorage.getItem('token')
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          // Decode JWT payload to get user info
          const payload = JSON.parse(
            atob(storedToken.split('.')[1])
          )
          // Fetch fresh user data from backend
          const res = await api.get('/auth/me')
          setUser(res.data.user || res.data)
          setToken(storedToken)
        } catch (err) {
          // Token invalid or expired
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login',
        { email, password })
      const { token: newToken, user: userData } = res.data

      if (!newToken || !userData) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)

      return userData
    } catch (err) {
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Show nothing while checking auth
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#08080F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          color: '#F59E0B', 
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🏆 RewardX
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ 
      user, token, login, logout,
      isAuthenticated: !!token,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
