import { startAuctionSettlementJob } from "./utils/auctionSettlement";

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Import configuration
const config = require("./config/config");
const connectDatabase = require("./config/database");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

// Import routes
const exampleRoutes = require("./routes/exampleRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const questionRoutes = require("./routes/questionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const userRoutes = require("./routes/userRoutes");
const upgradeRoutes = require("./routes/upgradeRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cors());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Online Auction API",
        info: "This is a template backend structure. Check /api/examples for example endpoints.",
    });
});

// Example routes - use this pattern for your own routes
app.use("/api/examples", exampleRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Question routes
app.use("/api/questions", questionRoutes);

// Bid routes
app.use("/api/bids", bidRoutes);

// User routes
app.use("/api/users", userRoutes);

// Use upgrade request
app.use("/api/upgrade", upgradeRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = config.port || 3000;

const startServer = async () => {
    try {
        // Connect to MongoDB Atlas
        await connectDatabase();

        // Start background job: auto-create orders when auctions end
        startAuctionSettlementJob();

        // Start server after successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${config.env}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
