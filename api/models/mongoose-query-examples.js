/**
 * Mongoose Query Examples
 * 
 * This file contains common Mongoose query patterns for reference
 * when building your own models and controllers.
 * 
 * NOTE: This is a REFERENCE file only - not meant to be executed.
 * The code examples below show different query patterns.
 * Copy the patterns you need into your actual controllers/models.
 * 
 * eslint-disable-next-line
 */

/* eslint-disable */

// ============================================
// BASIC CRUD OPERATIONS
// ============================================

// CREATE - Single document
const newItem = await Model.create({
  name: 'Example',
  description: 'Description'
});

// CREATE - Multiple documents
const items = await Model.insertMany([
  { name: 'Item 1' },
  { name: 'Item 2' }
]);

// READ - Find all
const allItems = await Model.find();

// READ - Find with filter
const activeItemsFiltered = await Model.find({ status: 'active' });

// READ - Find one document
const singleItem = await Model.findOne({ name: 'Example' });

// READ - Find by ID
const itemById = await Model.findById('507f1f77bcf86cd799439011');

// UPDATE - Find by ID and update
const updated = await Model.findByIdAndUpdate(
  '507f1f77bcf86cd799439011',
  { name: 'New Name' },
  { new: true, runValidators: true } // Options
);

// UPDATE - Update one document
const result = await Model.updateOne(
  { name: 'Old Name' },
  { name: 'New Name' }
);

// UPDATE - Update many documents
const multiUpdate = await Model.updateMany(
  { status: 'pending' },
  { status: 'active' }
);

// DELETE - Find by ID and delete
const deleted = await Model.findByIdAndDelete('507f1f77bcf86cd799439011');

// DELETE - Delete one document
const deleteResult = await Model.deleteOne({ name: 'Example' });

// DELETE - Delete many documents
const deleteMany = await Model.deleteMany({ status: 'inactive' });

// ============================================
// ADVANCED QUERIES
// ============================================

// PAGINATION
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const paginatedItems = await Model
  .find()
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });

const total = await Model.countDocuments();

// SORTING
const sorted = await Model.find().sort({ createdAt: -1 }); // Descending
const ascending = await Model.find().sort({ name: 1 }); // Ascending
const multiSort = await Model.find().sort({ status: 1, createdAt: -1 });

// SELECT SPECIFIC FIELDS
const selected = await Model.find().select('name description'); // Include
const excluded = await Model.find().select('-__v -password'); // Exclude

// POPULATE (for references)
const populated = await Model
  .findById('507f1f77bcf86cd799439011')
  .populate('author') // Populate single reference
  .populate({ path: 'comments', select: 'text createdAt' }); // With options

// COMPLEX FILTERS
const filtered = await Model.find({
  status: 'active',
  price: { $gte: 100, $lte: 1000 }, // Greater/Less than or equal
  name: { $regex: 'search', $options: 'i' }, // Case-insensitive search
  tags: { $in: ['electronics', 'new'] }, // Array contains
  createdAt: { $gt: new Date('2024-01-01') } // Date comparison
});

// LOGICAL OPERATORS
const orQuery = await Model.find({
  $or: [
    { status: 'active' },
    { featured: true }
  ]
});

const andQuery = await Model.find({
  $and: [
    { price: { $gte: 100 } },
    { status: 'active' }
  ]
});

const notQuery = await Model.find({
  status: { $ne: 'deleted' } // Not equal
});

// EXISTS
const hasDescription = await Model.find({
  description: { $exists: true, $ne: '' }
});

// ============================================
// AGGREGATION
// ============================================

// Basic aggregation
const aggregated = await Model.aggregate([
  { $match: { status: 'active' } },
  { $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' }
    }
  },
  { $sort: { count: -1 } }
]);

// Count documents
const count = await Model.countDocuments({ status: 'active' });

// Distinct values
const categories = await Model.distinct('category');

// ============================================
// TRANSACTIONS (for multi-document operations)
// ============================================

const session = await mongoose.startSession();
session.startTransaction();

try {
  await Model1.create([{ name: 'Item 1' }], { session });
  await Model2.create([{ name: 'Item 2' }], { session });
  
  await session.commitTransaction();
  console.log('Transaction successful');
} catch (error) {
  await session.abortTransaction();
  console.error('Transaction failed:', error);
} finally {
  session.endSession();
}

// ============================================
// VALIDATION & ERROR HANDLING
// ============================================

try {
  const item = await Model.create({ name: 'Test' });
} catch (error) {
  if (error.name === 'ValidationError') {
    // Handle validation errors
    const errors = Object.values(error.errors).map(e => e.message);
    console.log('Validation errors:', errors);
  } else if (error.code === 11000) {
    // Handle duplicate key error
    console.log('Duplicate key error');
  }
}

// ============================================
// CUSTOM STATIC METHODS (defined in schema)
// ============================================

// In your model file:
schema.statics.findByStatus = function(status) {
  return this.find({ status });
};

schema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Usage:
const activeItemsCustom = await Model.findActive();

// ============================================
// INSTANCE METHODS (defined in schema)
// ============================================

// In your model file:
schema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Usage:
const itemInstance = await Model.findById(id);
await itemInstance.activate();

// ============================================
// MIDDLEWARE/HOOKS
// ============================================

// Pre-save hook (in schema definition)
schema.pre('save', function(next) {
  // Runs before saving
  this.updatedAt = new Date();
  next();
});

// Post-save hook (in schema definition)
schema.post('save', function(doc, next) {
  // Runs after saving
  console.log('Document saved:', doc._id);
  next();
});

// ============================================
// VIRTUALS (computed properties)
// ============================================

// In schema definition:
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Usage (virtuals are not saved in DB):
const user = await User.findById(id);
console.log(user.fullName);

// ============================================
// TEXT SEARCH (requires text index)
// ============================================

// In schema definition:
schema.index({ name: 'text', description: 'text' });

// Usage:
const searchResults = await Model.find({
  $text: { $search: 'search query' }
});

// ============================================
// GEOSPATIAL QUERIES (for location data)
// ============================================

// In schema definition:
const schema = new Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
});
schema.index({ location: '2dsphere' });

// Usage - find nearby locations:
const nearby = await Model.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 5000 // meters
    }
  }
});

module.exports = {
  // This file is for reference only
  // Copy the patterns you need into your actual controllers
};
