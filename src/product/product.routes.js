import { Router } from 'express';
import { check } from 'express-validator';
import { getProducts, createProduct, updateProduct, deleteProduct } from './product.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { tieneRole } from '../middlewares/validar-roles.js';

const router = Router();

router.get('/', getProducts);

router.post(
  '/',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('name', 'El nombre del producto es obligatorio').not().isEmpty(),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('price', 'El precio debe ser un número').isNumeric(),
    check('stock', 'El stock debe ser un número').isNumeric(),
    check('category', 'El ID de la categoría es obligatorio').isMongoId(),
    validarCampos
  ],
  createProduct
);

router.put(
  '/:id',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  updateProduct
);

router.delete(
  '/:id',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  deleteProduct
);

export default router;
