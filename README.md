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
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)
- Google reCAPTCHA keys
- Git (for cloning repository)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OnlineAuction
```

### 2. Database Setup
1. **Create MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. **Create a Cluster**: Choose a free tier cluster (M0 Sandbox).
3. **Whitelist IP Address**: Add `0.0.0.0/0` to allow all IPs (for development; restrict in production).
4. **Create Database User**: Go to Database Access > Add New Database User. Note the username and password.
5. **Get Connection String**: Go to Clusters > Connect > Connect your application. Copy the connection string.

Example connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/online_auction?retryWrites=true&w=majority
```

### 3. Backend Setup
```bash
cd api
npm install

# Create environment file
cp .env.example .env
```

Edit `api/.env` and configure.

**Test database connection:**
```bash
npm run test:db
```
This should output `✓ Connected to MongoDB` if configured correctly.

### 4. Frontend Setup
```bash
cd ../web
npm install

# Create environment file
cp .env.example .env
```

Edit `web/.env` and configure.

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