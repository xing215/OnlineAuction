# Online Auction API

A minimal Express.js backend template with MongoDB.

## � Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string from [MongoDB Atlas](https://cloud.mongodb.com)

3. **Start server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see it running!

## 📁 Project Structure

```
├── config/          # Configuration (database, JWT)
├── controllers/     # Business logic
├── middleware/      # Auth, logging, error handling
├── models/          # Database schemas (Mongoose)
├── routes/          # API endpoints
├── utils/           # Helper functions
└── server.js        # Entry point
```

## 🔧 How It Works

**Request Flow:**
```
Client → Routes → Middleware → Controller → Model → Database
```

### Routes (`routes/`)
Define endpoints and connect them to controllers
```javascript
router.get('/', controller.getAll);      // GET /api/examples
router.post('/', controller.create);     // POST /api/examples
```

### Controllers (`controllers/`)
Handle requests and business logic
```javascript
exports.getAll = async (req, res) => {
  const items = await Model.find();
  res.json({ success: true, data: items });
};
```

### Models (`models/`)
Define data structure with Mongoose
```javascript
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: 'active' }
});
```

##  API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/examples` | No | Get all |
| GET | `/api/examples/:id` | No | Get one |
| POST | `/api/examples` | Yes | Create |
| PUT | `/api/examples/:id` | Yes | Update |
| DELETE | `/api/examples/:id` | Yes | Delete |

## 🧪 Testing with Postman

**Create item:**
```
POST http://localhost:3000/api/examples
Content-Type: application/json

{
  "name": "Test Item",
  "description": "Description here",
  "status": "active"
}
```

## Create Your Own Feature

**Example: Add a Product model**

1. **Model** (`models/productModel.js`)
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

2. **Controller** (`controllers/productController.js`)
```javascript
const Product = require('../models/productModel');

exports.getAll = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
```

3. **Routes** (`routes/productRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAll);
router.post('/', productController.create);

module.exports = router;
```

4. **Register in server.js**
```javascript
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
```

## 🛠️ Troubleshooting

**Database connection failed**
- Check MongoDB URI in `.env`
- Whitelist your IP in MongoDB Atlas

**Port already in use**
- Change `PORT` in `.env`

**Module not found**
- Run `npm install`

## 📖 Learn More

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [JWT Tokens](https://jwt.io/introduction)