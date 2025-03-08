import { Router } from 'express';
import { check } from 'express-validator';
import { createInvoice, updateInvoice, getInvoices, getInvoiceById } from './invoice.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.post(
  '/',
  [
    validarJWT,
    check('items', 'Los items son obligatorios y deben ser un arreglo').isArray({ min: 1 }),
    validarCampos
  ],
  createInvoice
);

router.put(
  '/:id',
  [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('items', 'Los items son obligatorios y deben ser un arreglo').isArray({ min: 1 }),
    validarCampos
  ],
  updateInvoice
);

router.get('/', validarJWT, getInvoices);

router.get(
  '/:id',
  [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  getInvoiceById
);

export default router;
