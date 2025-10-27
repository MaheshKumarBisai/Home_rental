import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Home, Building2, Calendar, User, LogOut, Shield, Plus, Menu, X, List } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOwner } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">
              RentEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link 
              to="/properties" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Properties</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link 
                  to="/bookings" 
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>My Bookings</span>
                </Link>

                {(isOwner || isAdmin) && (
                  <>
                    <Link 
                      to="/my-properties" 
                      className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
                    >
                      <List className="h-4 w-4" />
                      <span>My Properties</span>
                    </Link>

                    <Link 
                      to="/create-property" 
                      className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>List Property</span>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link 
                to="/login" 
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-all font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                <Building2 className="h-5 w-5" />
                <span>Properties</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                    <Calendar className="h-5 w-5" />
                    <span>My Bookings</span>
                  </Link>

                  {(isOwner || isAdmin) && (
                    <>
                      <Link to="/my-properties" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                        <List className="h-5 w-5" />
                        <span>My Properties</span>
                      </Link>

                      <Link to="/create-property" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-primary text-white">
                        <Plus className="h-5 w-5" />
                        <span>List Property</span>
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                      <Shield className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>

                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg bg-primary text-white text-center font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar