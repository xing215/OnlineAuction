const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    
    is_auto_bid: { type: Boolean, default: false },
    maximum_bid_limit: { type: Number, default: null }, 
    
    created_at: { type: Date, default: Date.now }
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

BidSchema.index({ product: 1, price: -1 }); 

BidSchema.virtual('masked_user_name').get(function() {
    if (this.user && this.user.full_name) {
        const name = this.user.full_name.trim();
        const parts = name.split(' ');
        const lastName = parts[parts.length - 1];
        return `****${lastName}`;
    }
    return '****User';
});

// Lấy giá hiện tại của sản phẩm 
BidSchema.statics.getCurrentPrice = async function(productId) {
    const highestBid = await this.findOne({ product: productId })
                                 .sort({ price: -1 }) 
                                 .select('price');   

    return highestBid ? highestBid.price : null;
};

// Lấy người đang thắng (Giá cao nhất hiện tại)
BidSchema.statics.getHighestBid = function(productId) {
    return this.findOne({ product: productId })
               .sort({ price: -1 }) 
               .populate('user', 'full_name email'); 
};

module.exports = mongoose.model('Bid', BidSchema);