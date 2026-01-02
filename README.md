# Online Auction Platform

A full-stack web application for conducting online auctions with real-time bidding, auto-bid functionality, and comprehensive order management.

## Features
### Core Functionality
- **Real-time Bidding**: Place manual bids or set up automatic bidding with max bid limits
- **Auto-extension**: Auctions automatically extend by 10 minutes when bids are placed near the end
- **Product Management**: Create listings with multiple images, categories, and detailed descriptions
- **Order System**: Automated order creation after auction ends with messaging between buyer/seller
- **User Ratings**: Positive/negative feedback system for buyers and sellers

### User Roles
- **Bidder**: Can browse and bid on active auctions
- **Seller**: Can create product listings and manage auctions
- **Admin**: Full system access including user management, categories, and upgrade requests

### Additional Features
- Email notifications (auction won, expired, bid bans)
- Product favorites/watchlist
- Advanced search and filtering
- reCAPTCHA protection
- OTP verification for sensitive actions
- Cloudinary image hosting

## Tech Stack

### Backend (`api/`)
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Cloudinary for image storage
- Nodemailer for email notifications
- CommonJS modules

### Frontend (`web/`)
- React 19 + TypeScript
- Vite build tool
- React Router v7
- Material-UI components
- Tailwind CSS
- React Hook Form + Zod validation
- React Hot Toast notifications
- ES Modules

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)
- Google reCAPTCHA keys

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OnlineAuction
```

### 2. Backend Setup
```bash
cd api
npm install

# Create environment file
cp .env.example .env
```

Edit `api/.env` and configure:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online_auction
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=24h
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
FRONTEND_URL=http://localhost:5173
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Test database connection:**
```bash
npm run test:db
```

### 3. Frontend Setup
```bash
cd ../web
npm install

# Create environment file
cp .env.example .env
```

Edit `web/.env` and configure:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd api
npm run dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd web
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Mode

**Backend:**
```bash
cd api
npm start
```

**Frontend:**
```bash
cd web
npm run build
npm run preview
```

## API Endpoints

Base URL: `/api`

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify OTP

### Products
- `GET /products` - List all products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (requires auth + seller role)
- `GET /products/top-expiring` - Products ending soon
- `GET /products/top-bidding` - Most active auctions

### Bidding
- `POST /bids/place` - Place manual or auto-bid
- `GET /bids/product/:productId` - Get bid history
- `GET /bids/user/:userId` - Get user's bids

### Orders
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/messages` - Send message
- `POST /orders/:id/rate` - Rate transaction

### Admin
- `GET /users` - List users (admin only)
- `PATCH /users/:id/role` - Update user role
- `GET /upgrade` - List upgrade requests
- `POST /categories` - Create category

## Key Features Explained

### Automatic Auction Settlement
A background cron job runs every 60 seconds to:
- Check for expired auctions
- Create orders for auctions with winning bids
- Send email notifications to buyers and sellers
- Mark products as sold or expired

### Auto-Bidding System
Users can set a maximum bid amount, and the system automatically:
- Places incremental bids on their behalf
- Competes with other bidders up to the max amount
- Notifies users if they're outbid

### Image Upload
- Minimum 3 images required per product
- Maximum 10 images allowed
- 10MB per image limit
- All images stored in Cloudinary