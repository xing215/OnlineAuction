/**
 * EXAMPLE CONTROLLER - MongoDB/Mongoose Implementation
 * 
 * This is an example controller to demonstrate the architecture.
 * Use this as a template when creating your own controllers.
 * 
 * Controllers contain the business logic and handle requests/responses.
 * They interact with models to perform database operations.
 */

const ExampleModel = require('../models/exampleModel');

/**
 * Get all records with pagination
 * GET /api/examples?page=1&limit=10&status=active
 */
exports.getAll = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, status } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Execute query with pagination
    const records = await ExampleModel
      .find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await ExampleModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { 
        records, 
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single record by ID
 * GET /api/examples/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await ExampleModel.findById(id);

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: 'Record not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: { record }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new record
 * POST /api/examples
 */
exports.create = async (req, res, next) => {
  try {
    const { name, description, status, tags } = req.body;

    // Create record (validation is handled by Mongoose schema)
    const record = await ExampleModel.create({ 
      name, 
      description,
      status,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: { record }
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
};

/**
 * Update a record
 * PUT /api/examples/:id
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await ExampleModel.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: { record }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
};

/**
 * Delete a record
 * DELETE /api/examples/:id
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await ExampleModel.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active records
 * GET /api/examples/active
 */
exports.getActive = async (req, res, next) => {
  try {
    const records = await ExampleModel.findActive();

    res.status(200).json({
      success: true,
      data: { records, count: records.length }
    });
  } catch (error) {
    next(error);
  }
};
