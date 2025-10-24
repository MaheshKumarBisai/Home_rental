# 🏠 House Rental Platform - Frontend

A modern, responsive React application for a house rental platform with real-time chat, property booking, and admin dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend API URL
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

The app will open at: **http://localhost:3000**

## 📦 Tech Stack

- **React 18.2** - UI Library
- **Vite 5.0** - Build Tool
- **Tailwind CSS 3.4** - Styling
- **React Router DOM 6.20** - Routing
- **Axios 1.6** - HTTP Client
- **Socket.io-client 4.6** - Real-time Chat
- **React Hook Form 7.49** - Form Handling
- **Yup 1.3** - Validation
- **React Hot Toast 2.4** - Notifications
- **Lucide React 0.300** - Icons
- **Framer Motion 11.0** - Animations
- **React DatePicker 4.24** - Date Selection
- **Recharts 2.10** - Charts
- **React Slick 0.29** - Carousels

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                # API service layer
│   │   ├── authService.js
│   │   ├── propertyService.js
│   │   ├── bookingService.js
│   │   ├── reviewService.js
│   │   ├── chatService.js
│   │   └── adminService.js
│   │
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── PropertyCard.jsx
│   │   ├── Loader.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── context/            # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── SocketContext.jsx
│   │
│   ├── layouts/            # Layout wrappers
│   │   ├── MainLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── AdminLayout.jsx
│   │
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Properties.jsx
│   │   ├── PropertyDetails.jsx
│   │   ├── Bookings.jsx
│   │   ├── Chat.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── NotFound.jsx
│   │
│   ├── utils/              # Utility functions
│   │   ├── api.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## ✨ Features

### 1. **Authentication** 🔐
- User registration (Renter/Owner)
- Login/Logout
- JWT token management
- Protected routes
- Profile management

### 2. **Property Management** 🏡
- Browse all properties
- Advanced search & filters
- Property details with image carousel
- Reviews and ratings
- Booking widget

### 3. **Booking System** 📅
- Create bookings
- View booking history
- Cancel bookings
- Date range picker
- Booking status tracking

### 4. **Real-Time Chat** 💬
- Socket.io integration
- Per-booking chat rooms
- Message history
- Real-time updates

### 5. **Admin Dashboard** 👨‍💼
- Platform statistics
- User management
- Property moderation
- Block/unblock users
- Revenue tracking

### 6. **Theme** 🌓
- Light/Dark mode toggle
- Persistent theme preference
- Smooth transitions

### 7. **Responsive Design** 📱
- Mobile-first approach
- Works on all devices
- Touch-friendly interface

## 🎨 Design System

### Colors
- **Primary:** Indigo (#6366f1)
- **Secondary:** Purple (#8b5cf6)
- **Success:** Green (#10b981)
- **Error:** Red (#ef4444)

### Typography
- **Font:** Inter (Google Fonts)
- Responsive text sizes
- Clear hierarchy

### Components
- Rounded corners (rounded-2xl)
- Soft shadows
- Smooth transitions
- Hover effects

## 🔌 API Integration

All API endpoints are integrated:

### Authentication
```javascript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
POST /api/auth/logout
```

### Properties
```javascript
GET /api/properties/all
GET /api/properties/:id
GET /api/properties/search
POST /api/properties/create
PUT /api/properties/update/:id
DELETE /api/properties/delete/:id
```

### Bookings
```javascript
POST /api/bookings/create
GET /api/bookings/user/:id
DELETE /api/bookings/cancel/:id
```

### Reviews
```javascript
POST /api/reviews/add
GET /api/reviews/property/:id
```

### Chat
```javascript
GET /api/chat/booking/:id
Socket Events: joinRoom, sendMessage, receiveMessage
```

### Admin
```javascript
GET /api/admin/stats
GET /api/admin/users
PUT /api/admin/block/:id
```

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📱 Responsive Breakpoints

- **sm:** 640px (Mobile landscape)
- **md:** 768px (Tablet)
- **lg:** 1024px (Laptop)
- **xl:** 1280px (Desktop)
- **2xl:** 1536px (Large desktop)

## 🔒 Security

- JWT token storage in localStorage
- Auto-refresh token mechanism
- Protected routes with role checking
- Input validation on forms
- CORS-enabled API calls

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` folder

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### Environment Variables
Set these in your deployment platform:
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## 🐛 Troubleshooting

### Issue: API calls failing
**Solution:** Check `VITE_API_URL` in .env and ensure backend is running

### Issue: Socket.io not connecting
**Solution:** Verify `VITE_SOCKET_URL` matches your backend Socket.io server

### Issue: Dark mode not persisting
**Solution:** Check browser localStorage is enabled

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🎯 Key Features Implemented

✅ User Authentication (Login/Register)  
✅ Property Listings with Filters  
✅ Property Details with Reviews  
✅ Booking Management System  
✅ Real-Time Chat (Socket.io)  
✅ User Profile Management  
✅ Admin Dashboard with Statistics  
✅ Dark Mode Toggle  
✅ Responsive Design  
✅ Protected Routes  
✅ Loading States  
✅ Toast Notifications  
✅ Form Validation

## 📄 License

MIT License

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

**Perfect integration with the House Rental Backend API**
