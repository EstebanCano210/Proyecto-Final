import { response, request } from 'express';
import Category from '../categories/category.model.js';
import Product from '../product/product.model.js';

export const getCategories = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };

    const [ total, categories ] = await Promise.all([
      Category.countDocuments(query),
      Category.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.status(200).json({
      success: true,
      total,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener categorías',
      error
    });
  }
};

export const createCategory = async (req = request, res = response) => {
  try {
    const { name, description } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        msg: 'La categoría ya existe'
      });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({
      success: true,
      msg: 'Categoría creada exitosamente',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al crear la categoría',
      error: error.message
    });    
  }
};

export const updateCategory = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!category) {
      return res.status(404).json({
        success: false,
        msg: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Categoría actualizada',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al actualizar la categoría',
      error
    });
  }
};

export const deleteCategory = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        msg: 'Categoría no encontrada'
      });
    }

    const defaultCategoryId = process.env.DEFAULT_CATEGORY_ID;
    if (!defaultCategoryId) {
      return res.status(500).json({
        success: false,
        msg: 'Categoría predeterminada no configurada en el sistema'
      });
    }

    if (category._id.toString() === defaultCategoryId) {
      return res.status(400).json({
        success: false,
        msg: 'No se puede eliminar la categoría predeterminada'
      });
    }

    await Product.updateMany(
      { category: id },
      { category: defaultCategoryId }
    );

    category.status = false;
    await category.save();

    res.status(200).json({
      success: true,
      msg: 'Categoría eliminada y productos transferidos a la categoría predeterminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar la categoría',
      error
    });
  }
};
