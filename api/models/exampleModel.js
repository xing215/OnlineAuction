/**
 * EXAMPLE MODEL - MongoDB/Mongoose Implementation
 * 
 * This is an example model using Mongoose to demonstrate the architecture.
 * Use this as a template when creating your own models.
 * 
 * Models represent your data structure and contain methods
 * to interact with MongoDB (CRUD operations).
 */

const mongoose = require('mongoose');

// Define the schema
const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    tags: [{
      type: String,
      trim: true
    }],
    metadata: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
exampleSchema.index({ name: 1 });
exampleSchema.index({ status: 1 });
exampleSchema.index({ createdAt: -1 });

// Virtual properties (computed fields)
exampleSchema.virtual('nameUpper').get(function() {
  return this.name ? this.name.toUpperCase() : '';
});

// Instance methods
exampleSchema.methods.toSummary = function() {
  return {
    id: this._id,
    name: this.name,
    status: this.status,
    createdAt: this.createdAt
  };
};

// Static methods
exampleSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

exampleSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Middleware (hooks)
exampleSchema.pre('save', function(next) {
  console.log('About to save:', this.name);
  next();
});

exampleSchema.post('save', function(doc, next) {
  console.log('Saved:', doc.name);
  next();
});

// Create and export the model
const ExampleModel = mongoose.model('Example', exampleSchema);

module.exports = ExampleModel;
