# SportsHub - Sports Facility Management Platform

<div align="center">
  <img src="./frontend/public/images/logo/logo_no_bg.png" alt="SportsHub Logo" width="200" />
  <h3>Book stadiums, join tournaments, and explore football academies with ease</h3>
</div>

## 📋 Overview

SportsHub is a comprehensive web platform designed to connect sports enthusiasts with facilities, academies, and tournaments. The application enables users to book stadiums, join tournaments, explore football academies, and manage teams - all in one centralized platform.

### Key Features

- **Stadium Booking:** Browse and book sports facilities with real-time availability
- **Tournament Management:** Create, join, and manage tournaments
- **Academy Directory:** Discover and register for sports academies
- **Team Management:** Create and manage teams for tournaments
- **User Profiles:** Personalized user accounts with booking history
- **Admin Dashboard:** Comprehensive administrative tools for platform management
- **Notification System:** Updates and alerts for bookings and events

## 🚀 Technology Stack

### Backend
- **Node.js & Express:** Server-side application framework
- **MongoDB:** NoSQL database for data storage
- **JWT Authentication:** Secure user authentication and authorization
- **Nodemailer:** Email service integration for notifications and verifications
- **Multer:** File upload handling for images and documents
- **Interval-based Cleanup:** Automatic completion of expired bookings

### Frontend
- **Next.js 15:** React framework with server-side rendering
- **React 19:** Frontend UI library
- **TypeScript:** Type-safe JavaScript
- **Tailwind CSS:** Utility-first CSS framework
- **Axios:** HTTP client for API requests
- **React Toastify:** Toast notifications
- **FullCalendar:** Calendar integration for bookings
- **ApexCharts:** Data visualization components

## 🏗️ Project Structure

```
sportshub-web/
├── backend/                # Backend Node.js/Express server
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
└── frontend/               # Frontend Next.js application
    ├── public/             # Static assets
    └── src/
        ├── app/            # Next.js app directory
        │   ├── (public)/   # Public routes
        │   ├── auth/       # Authentication routes
        │   └── dashboard/  # Admin dashboard routes
        ├── components/     # React components
        ├── context/        # React context providers
        ├── hooks/          # Custom React hooks
        ├── icons/          # SVG icons
        ├── layout/         # Layout components
        ├── lib/            # Library functions
        └── types/          # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email_for_notifications
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🔒 Authentication

SportsHub offers authentication features including:
- Email/password registration and login
- JWT-based authentication
- Password reset functionality with email verification
- User session management

## 📱 Features in Detail

### Stadium Management
- Create and manage stadium listings with multiple images
- Set availability schedules and pricing
- Location integration with maps
- Detailed facility information

### Booking System
- Availability checking
- Slot-based booking system
- Booking history and management
- Automatic completion of expired bookings

### Academy System
- Academy profiles with training programs
- Instructor information
- Registration and enrollment tracking
- Reviews and ratings

### Tournament Management
- Tournament creation with customizable settings
- Team registration and management
- Scheduling and fixture generation
- Results tracking

### Notification System
- User notifications for important events
- Team invitation notifications
- Stadium, academy and tournament updates
- Notification management

### User Roles and Permissions
- User
- Team Manager
- Academy Manager
- Stadium Owner
- Administrator
- Referee

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)

---

<div align="center">
  <p>Developed by <a href="https://github.com/hamzahowaidat">Hamzah Owaidat</a></p>
  <p>© 2025 SportsHub. All rights reserved.</p>
</div>
