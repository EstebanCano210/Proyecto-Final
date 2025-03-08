import { response, request } from 'express';
import Product from './product.model.js';
import Category from '../categories/category.model.js';

export const getProducts = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .populate('category', 'name')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.status(200).json({
      success: true,
      total,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener productos',
      error
    });
  }
};

export const createProduct = async (req = request, res = response) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const productExists = await Product.findOne({ name });
    if (productExists) {
      return res.status(400).json({
        success: false,
        msg: 'El producto ya existe'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        msg: 'Categoría no encontrada'
      });
    }

    const product = new Product({ name, description, price, stock, category });
    await product.save();

    res.status(201).json({
      success: true,
      msg: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al crear producto',
      error
    });
  }
};

export const updateProduct = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          msg: 'Categoría no encontrada'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, category },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        msg: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Producto actualizado',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al actualizar producto',
      error
    });
  }
};

export const deleteProduct = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        msg: 'Producto no encontrado'
      });
    }

    product.status = false;
    await product.save();

    res.status(200).json({
      success: true,
      msg: 'Producto eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar producto',
      error
    });
  }
};
