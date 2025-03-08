import { response, request } from 'express';
import Cart from './cart.model.js';
import Product from '../product/product.model.js';
import Invoice from '../invoice/invoice.model.js';

export const getCart = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price stock');
    res.status(200).json({
      success: true,
      cart: cart || { user: userId, items: [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener el carrito',
      error
    });
  }
};

export const addToCart = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    const { product, quantity } = req.body;

    const prod = await Product.findById(product);
    if (!prod || !prod.estado) {
      return res.status(404).json({
        success: false,
        msg: 'Producto no encontrado'
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();
    res.status(200).json({
      success: true,
      msg: 'Producto agregado al carrito',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al agregar producto al carrito',
      error
    });
  }
};

export const removeFromCart = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    const { product } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        msg: 'Carrito no encontrado'
      });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== product);
    await cart.save();

    res.status(200).json({
      success: true,
      msg: 'Producto removido del carrito',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al remover producto del carrito',
      error
    });
  }
};

export const clearCart = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    res.status(200).json({
      success: true,
      msg: 'Carrito limpiado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al limpiar el carrito',
      error
    });
  }
};

export const checkoutCart = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'El carrito está vacío'
      });
    }

    let total = 0;
    const invoiceItems = [];

    for (const item of cart.items) {
      const prod = await Product.findById(item.product);
      if (!prod || !prod.estado) {
        return res.status(404).json({
          success: false,
          msg: `Producto con ID ${item.product} no encontrado`
        });
      }

      if (prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          msg: `Stock insuficiente para el producto ${prod.name}`
        });
      }

      const price = prod.price;
      const subtotal = price * item.quantity;
      total += subtotal;
      invoiceItems.push({ product: item.product, quantity: item.quantity, price, subtotal });
    }

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const newInvoice = new Invoice({
      user: userId,
      items: invoiceItems,
      total
    });
    await newInvoice.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      msg: 'Compra realizada exitosamente',
      invoice: newInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al realizar la compra',
      error
    });
  }
};
