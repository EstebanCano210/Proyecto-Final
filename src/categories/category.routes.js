import { Router } from 'express';
import { check } from 'express-validator';
import { getCategories, createCategory, updateCategory, deleteCategory } from './category.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { tieneRole } from '../middlewares/validar-roles.js';

const router = Router();

router.get('/', getCategories);

router.post(
  '/',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('description', 'Es necesaria una descripcion').not().isEmpty(), // <-- Agrega los paréntesis aquí
    validarCampos
  ],
  createCategory
);

router.put(
  '/:id',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('description', 'Es necesaria una descripcion').not().isEmpty(),
    validarCampos
  ],
  updateCategory
);

router.delete(
  '/:id',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  deleteCategory
);

export default router;
