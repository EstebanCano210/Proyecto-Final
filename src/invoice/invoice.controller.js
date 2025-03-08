import { response, request } from 'express';
import Invoice from './invoice.model.js';
import Product from '../product/product.model.js';

export const createInvoice = async (req = request, res = response) => {
  try {
    const { items } = req.body;
    const user = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Debe incluir al menos un producto en la factura'
      });
    }

    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      const { product, quantity } = item;
      const prod = await Product.findById(product);
      if (!prod || !prod.estado) {
        return res.status(404).json({
          success: false,
          msg: `Producto con ID ${product} no encontrado`
        });
      }

      if (prod.stock < quantity) {
        return res.status(400).json({
          success: false,
          msg: `Stock insuficiente para el producto ${prod.name}`
        });
      }

      const price = prod.price;
      const subtotal = price * quantity;
      total += subtotal;

      invoiceItems.push({ product, quantity, price, subtotal });
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const newInvoice = new Invoice({
      user: user.uid,
      items: invoiceItems,
      total
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      msg: 'Factura creada exitosamente',
      invoice: newInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al crear la factura',
      error
    });
  }
};

export const updateInvoice = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice || !invoice.estado) {
      return res.status(404).json({
        success: false,
        msg: 'Factura no encontrada'
      });
    }

    for (const item of invoice.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      const { product, quantity } = item;
      const prod = await Product.findById(product);
      if (!prod || !prod.estado) {
        return res.status(404).json({
          success: false,
          msg: `Producto con ID ${product} no encontrado`
        });
      }

      if (prod.stock < quantity) {
        return res.status(400).json({
          success: false,
          msg: `Stock insuficiente para el producto ${prod.name}`
        });
      }

      const price = prod.price;
      const subtotal = price * quantity;
      total += subtotal;
      invoiceItems.push({ product, quantity, price, subtotal });
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    invoice.items = invoiceItems;
    invoice.total = total;
    await invoice.save();

    res.status(200).json({
      success: true,
      msg: 'Factura actualizada',
      invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al actualizar la factura',
      error
    });
  }
};

export const getInvoices = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const query = { estado: true };

    const user = req.user;
    if (user.role === 'CLIENT') {
      query.user = user.uid;
    }

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(query),
      Invoice.find(query)
        .populate('user', 'username email')
        .populate('items.product', 'name price')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.status(200).json({
      success: true,
      total,
      invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener facturas',
      error
    });
  }
};

export const getInvoiceById = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('user', 'username email')
      .populate('items.product', 'name price');
    if (!invoice || !invoice.estado) {
      return res.status(404).json({
        success: false,
        msg: 'Factura no encontrada'
      });
    }
    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener la factura',
      error
    });
  }
};
