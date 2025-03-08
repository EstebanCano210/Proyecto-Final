import { Router } from 'express';
import { check } from 'express-validator';
import { getCart, addToCart, removeFromCart, clearCart, checkoutCart } from './cart.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.get('/', validarJWT, getCart);

router.post(
  '/add',
  [
    validarJWT,
    check('product', 'El ID del producto es obligatorio').isMongoId(),
    check('quantity', 'La cantidad debe ser un número mayor a 0').isInt({ gt: 0 }),
    validarCampos
  ],
  addToCart
);

router.post(
  '/remove',
  [
    validarJWT,
    check('product', 'El ID del producto es obligatorio').isMongoId(),
    validarCampos
  ],
  removeFromCart
);

router.delete('/clear', validarJWT, clearCart);

router.post('/checkout', validarJWT, checkoutCart);

export default router;
