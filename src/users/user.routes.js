import { Router } from 'express';
import { check } from 'express-validator';
import { getUsers, updateUserProfile, changeUserRole, deleteUser } from './user.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { tieneRole } from '../middlewares/validar-roles.js';

const router = Router();

router.get('/', [validarJWT, tieneRole('ADMIN')], getUsers);

router.put('/profile', 
  [
    validarJWT,
    check('email', 'El correo es obligatorio').isEmail(),
    check('username', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
  ], 
  updateUserProfile
);

router.put(
  '/:id/role',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    check('role', 'El rol es obligatorio y debe ser ADMIN o CLIENT').not().isEmpty(),
    validarCampos
  ],
  changeUserRole
);

router.delete(
  '/:id',
  [
    validarJWT,
    tieneRole('ADMIN'),
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  deleteUser
);

export default router;
