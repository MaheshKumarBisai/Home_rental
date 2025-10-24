import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <Loader fullScreen />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute