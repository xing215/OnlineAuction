const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductQuestionSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    asker: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 

    question: { 
        type: String, 
        required: true, 
        trim: true 
    },
    asked_at: { type: Date, default: Date.now },

    answer: { 
        type: String, 
        default: null 
    },
    answered_at: { type: Date, default: null }

}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// Index để load danh sách câu hỏi của 1 sản phẩm
ProductQuestionSchema.index({ product: 1, asked_at: -1 }); 

// Che tên người hỏi
ProductQuestionSchema.virtual('masked_asker_name').get(function() {
    if (this.asker && this.asker.full_name) {
        const name = this.asker.full_name.trim();
        const parts = name.split(' ');
        const lastName = parts[parts.length - 1];
        return `****${lastName}`;
    }
    return '****User';
});

module.exports = mongoose.model('ProductQuestion', ProductQuestionSchema);