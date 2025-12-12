const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { 
      type: String,
      required: true, 
      // index: 'text', 
      trim: true 
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    category_name: { type: String },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
 
    images: { 
      type: [String],
      validate: [val => val.length >= 3, 'Product must have at least 3 images']}
    , 
    description: { type: String }, 
    
    description_updates: [{
        content: { type: String },
        created_at: { type: Date, default: Date.now }
    }],

    start_price: { type: Number, required: true }, 
    step_price: { type: Number, required: true }, 
    buy_now_price: { type: Number, default: null }, 
    
    current_price: { type: Number, default: 0 }, 
    current_bidder: { type: Schema.Types.ObjectId, ref: 'User', default: null }, 
    bid_count: { type: Number, default: 0 }, 

    posted_at: { type: Date, default: Date.now }, 
    end_date: { type: Date, required: true },
    
    status: { 
        type: String, 
        enum: ['active', 'sold', 'expired', 'deleted'], 
        default: 'active' 
    },

    banned_bidders: [{ type: Schema.Types.ObjectId, ref: 'User' }]

}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({
  name: 'text',
  category_name: 'text'
});
ProductSchema.index({ status: 1, end_date: 1 }); 
ProductSchema.index({ status: 1, bid_count: -1 }); 
// ProductSchema.index({ status: 1, current_price: -1 }); 

// Virtual properties
ProductSchema.virtual('time_remaining').get(function() {
    if (this.status !== 'active') return 0;
    const remaining = this.end_date - Date.now();
    return remaining > 0 ? remaining : 0;
});

// Instance methods
ProductSchema.methods.autoExtendDuration = async function(minutes = 10) {
    this.end_date = new Date(this.end_date.getTime() + minutes * 60000);
    return this.save();
};

ProductSchema.methods.isBidderBanned = function(userId) {
    if (!this.banned_bidders || this.banned_bidders.length === 0) return false;
    return this.banned_bidders.includes(userId);
};

// Static methods
// Lấy Top 5 sản phẩm sắp kết thúc
ProductSchema.statics.findTopExpiring = function(limit = 5) {
    return this.find({ 
        status: 'active', 
        end_date: { $gt: new Date() } 
    })
    .sort({ end_date: 1 }) 
    .limit(limit)
    .populate('category', 'name'); 
};

// Lấy Top 5 sản phẩm nhiều lượt ra giá nhất
ProductSchema.statics.findTopBidding = function(limit = 5) {
    return this.find({ status: 'active' })
               .sort({ bid_count: -1 })
               .limit(limit)
               .populate('category', 'name');
};

// Lấy Top 5 sản phẩm giá cao nhất
ProductSchema.statics.findTopPrice = function(limit = 5) {
    return this.find({ status: 'active' })
               .sort({ current_price: -1 })
               .limit(limit)
               .populate('category', 'name');
};
// Lấy sản phẩm theo ID
ProductSchema.statics.getProductById = function(productId) {
    return this.findById(productId)
               .populate('category', 'name')
               .populate('seller', 'username email');
}

// Lấy đánh giá người bán theo user ID
ProductSchema.statics.getSellerRatingSummary = function(sellerId) {
    return this.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
        {
            $group: {
                _id: "$seller",
                averageRating: { $avg: "$rating" }, // Assuming there's a rating field
                totalRatings: { $sum: 1 }
            }
        }
    ]);
};

// Lấy sản phẩm theo danh mục
ProductSchema.statics.getProductsByCategory = function(categoryId) {
    return this.find({ category: categoryId })
               .populate('category', 'name');
}

// Lấy tên người bán theo seller ID
ProductSchema.statics.getSellerById = function(sellerId) {
    return this.model('User').findById(sellerId);
};

// Update product description
ProductSchema.statics.updateProductDescription = async function(productId, newDescription) {
    const product = await this.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    product.description_updates.push({ 
        content: newDescription,
        created_at: new Date()
    });
    return product.save();
};

module.exports = mongoose.model('Product', ProductSchema);