import { Schema, model } from 'mongoose';

const InvoiceItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  }
});

const InvoiceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [InvoiceItemSchema],
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  versionKey: false,
});

InvoiceSchema.methods.toJSON = function () {
  const { __v, _id, ...invoice } = this.toObject();
  invoice.uid = _id;
  return invoice;
};

export default model('Invoice', InvoiceSchema);
