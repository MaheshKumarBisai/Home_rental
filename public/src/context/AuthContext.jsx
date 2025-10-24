import { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../api/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await authAPI.getProfile()
          setUser(response.data.data.user)
        } catch (error) {
          logout()
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [accessToken])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user, accessToken, refreshToken } = response.data.data

      setUser(user)
      setAccessToken(accessToken)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      toast.success(`Welcome back, ${user.firstName}!`)
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return { success: false, error }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user, accessToken, refreshToken } = response.data.data

      setUser(user)
      setAccessToken(accessToken)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      toast.success(`Welcome, ${user.firstName}!`)
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return { success: false, error }
    }
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await authAPI.logout(refreshToken)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAccessToken(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      setUser(response.data.data.user)
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
      return { success: false, error }
    }
  }

  const value = {
    user,
    loading,
    accessToken,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isOwner: user?.role === 'OWNER',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}