import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthLayout = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4">
      <Outlet />
    </div>
  )
}

export default AuthLayout