# 🏠 House Rental & Property Booking Platform - Backend API

A complete, production-ready backend system for a house rental and property booking platform built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

## ✨ Features

### 1. **User Authentication & Authorization**
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Role-based access control (Renter, Owner, Admin)
- User profile management

### 2. **Property Management**
- Full CRUD operations for rental properties
- Image upload support (Cloudinary integration)
- Advanced search and filtering
- Pagination and sorting

### 3. **Booking System**
- Create and manage bookings
- **Double-booking prevention** with date conflict checking
- Automatic price calculation
- Booking status management

### 4. **Real-Time Chat**
- Socket.io integration for real-time messaging
- Chat history persistence
- Per-booking chat rooms

### 5. **Reviews & Ratings**
- Property rating system (1-5 stars)
- Review management
- Average rating calculation

### 6. **Admin Dashboard**
- Platform statistics
- User management
- Property moderation
- Revenue tracking

### 7. **Security Features**
- Helmet.js for security headers
- Rate limiting
- CORS protection
- Input validation with Joi

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT + bcrypt |
| **Real-time** | Socket.io |
| **Validation** | Joi |
| **File Upload** | Multer + Cloudinary |
| **Testing** | Jest + Supertest |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Cloudinary account** (for image uploads)

## 🚀 Installation

### Step 1: Clone or Extract the Project

```bash
# If you have the zip file, extract it
unzip house-rental-backend.zip
cd house-rental-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Update with your PostgreSQL credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/house_rental_db?schema=public"

# JWT Configuration (Generate strong secrets)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_min_32_characters
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_min_32_characters
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🗄 Database Setup

### Step 1: Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE house_rental_db;

# Exit
\q
```

### Step 2: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start at: `http://localhost:5000`

### Check Health

Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "status": "success",
  "message": "House Rental API is running!",
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| GET | `/auth/profile` | Get user profile | Private |
| PUT | `/auth/profile` | Update profile | Private |
| POST | `/auth/logout` | Logout user | Private |

### Property Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/properties/create` | Create property | Owner/Admin |
| GET | `/properties/:id` | Get property details | Public |
| GET | `/properties/all` | List all properties | Public |
| GET | `/properties/search` | Search properties | Public |
| PUT | `/properties/update/:id` | Update property | Owner/Admin |
| DELETE | `/properties/delete/:id` | Delete property | Owner/Admin |

### Booking Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/bookings/create` | Create booking | Private |
| GET | `/bookings/user/:id` | Get user bookings | Private |
| GET | `/bookings/property/:id` | Get property bookings | Owner |
| DELETE | `/bookings/cancel/:id` | Cancel booking | Private |

### Review Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/reviews/add` | Add review | Private |
| GET | `/reviews/property/:id` | Get property reviews | Public |
| DELETE | `/reviews/:id` | Delete review | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/stats` | Platform statistics | Admin |
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/block/:id` | Block/unblock user | Admin |
| DELETE | `/admin/property/:id` | Delete property | Admin |

## 🧪 Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Test Coverage

The test suite includes:
- ✅ User authentication (register, login, JWT)
- ✅ Property CRUD operations
- ✅ Booking creation with double-booking prevention
- ✅ Protected route access control
- ✅ Input validation

## 📁 Project Structure

```
house-rental-backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── propertyController.js  # Property CRUD
│   ├── bookingController.js   # Booking management
│   ├── chatController.js      # Chat operations
│   ├── reviewController.js    # Review system
│   └── adminController.js     # Admin operations
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── validation.js          # Input validation
│   ├── errorHandler.js        # Error handling
│   └── upload.js              # File upload
├── models/
│   └── prisma/
│       └── schema.prisma      # Database schema
├── routes/
│   ├── authRoutes.js
│   ├── propertyRoutes.js
│   ├── bookingRoutes.js
│   ├── chatRoutes.js
│   ├── reviewRoutes.js
│   └── adminRoutes.js
├── tests/
│   ├── auth.test.js
│   ├── property.test.js
│   └── booking.test.js
├── utils/
│   └── tokenUtils.js          # JWT utilities
├── uploads/                   # Temporary file storage
├── .env.example
├── .gitignore
├── app.js                     # Express app setup
├── server.js                  # Entry point
├── package.json
├── jest.config.js
└── README.md
```

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create your-app-name
```

3. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. Set environment variables:
```bash
heroku config:set ACCESS_TOKEN_SECRET=your_secret
heroku config:set REFRESH_TOKEN_SECRET=your_secret
# ... set all other env variables
```

5. Deploy:
```bash
git push heroku main
```

### Deploy to Render

1. Create account on Render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Set environment variables in dashboard
5. Deploy automatically

## 🔒 Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Refresh token rotation
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS protection
- Input validation and sanitization
- SQL injection protection (Prisma ORM)

## 📝 API Request Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "RENTER"
  }'
```

### Create Property

```bash
curl -X POST http://localhost:5000/api/properties/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Beautiful 2BHK Apartment",
    "description": "Spacious apartment with modern amenities",
    "price": 25000,
    "address": "123 Main St",
    "city": "Mumbai",
    "type": "APARTMENT",
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["WiFi", "Parking"],
    "images": ["https://example.com/image.jpg"]
  }'
```

### Create Booking

```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "propertyId": "property-uuid",
    "checkInDate": "2025-11-01",
    "checkOutDate": "2025-11-10"
  }'
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Reset database
npm run prisma:migrate -- --name init
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID
```

## 🤝 Contributing

This is a complete working backend system. Feel free to extend it with additional features.

## 📄 License

MIT License

## 👨‍💻 Author

Built as a comprehensive house rental platform backend system.

---

**🎉 Your backend is ready! Start building your frontend application.**
