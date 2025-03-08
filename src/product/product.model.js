import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    versionKey: false,
});

ProductSchema.methods.toJSON = function () {
    const { __v, _id, ...product } = this.toObject();
    product.uid = _id;
    return product;
};

export default model('Product', ProductSchema);
