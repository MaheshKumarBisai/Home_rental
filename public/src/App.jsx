import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Properties = lazy(() => import('./pages/Properties'))
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'))
const CreateProperty = lazy(() => import('./pages/CreateProperty'))
const MyProperties = lazy(() => import('./pages/MyProperties'))
const Bookings = lazy(() => import('./pages/Bookings'))
const CreateBooking = lazy(() => import('./pages/CreateBooking'))
const Chat = lazy(() => import('./pages/Chat'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes - All Users */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Routes - Owner/Admin Only */}
          <Route element={<ProtectedRoute requiredRole={['OWNER', 'ADMIN']}><MainLayout /></ProtectedRoute>}>
            <Route path="/create-property" element={<CreateProperty />} />
            <Route path="/my-properties" element={<MyProperties />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App