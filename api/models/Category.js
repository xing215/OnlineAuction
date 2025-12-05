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

// Lấy cấu trúc cây danh mục
CategorySchema.statics.getTree = async function() {
    const roots = await this.getRoots();
    const tree = [];

    for (const root of roots) {
        const children = await this.getChildren(root._id);
        const childTree = [];

        for (const child of children) {
            const grandChildren = await this.getChildren(child._id);
            childTree.push({
                id: child._id,
                name: child.name,
                child: grandChildren.map(gc => ({ id: gc._id, name: gc.name, child: [] }))
            });
        }

        tree.push({
            id: root._id,
            name: root.name,
            child: childTree
        });
    }

    return tree;
};

//Lấy danh sách tất cả danh mục
CategorySchema.statics.getAllCategories = function() {
    return this.find({ is_active: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', CategorySchema);