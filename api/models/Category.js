const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true }, 
    parent_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Category',
        default: null 
    }, 
    is_active: { type: Boolean, default: true }
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

CategorySchema.index({ parent_id: 1 }); 

// Lấy danh sách danh mục cha 
CategorySchema.statics.getRoots = function() {
    return this.find({ 
        parent_id: null, 
        is_active: true 
    }).sort({ name: 1 }); 
};

//Lấy danh sách danh mục con
CategorySchema.statics.getChildren = function(parentId) {
    return this.find({ 
        parent_id: parentId, 
        is_active: true 
    }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', CategorySchema);