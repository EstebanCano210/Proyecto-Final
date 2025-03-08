import { Schema, model } from 'mongoose';

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  }
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  items: [CartItemSchema]
}, {
  timestamps: true,
  versionKey: false,
});

CartSchema.methods.toJSON = function () {
  const { __v, _id, ...cart } = this.toObject();
  cart.uid = _id;
  return cart;
};

export default model('Cart', CartSchema);
