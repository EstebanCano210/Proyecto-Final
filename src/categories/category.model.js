import { Schema, model } from 'mongoose';

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  versionKey: false,
});

CategorySchema.methods.toJSON = function () {
  const { __v, _id, ...category } = this.toObject();
  category.uid = _id;
  return category;
};

export default model('Category', CategorySchema);
