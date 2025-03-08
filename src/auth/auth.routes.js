import { Router } from 'express';
import { check } from 'express-validator';
import { registerUser, loginUser } from '../auth/auth.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();

// Registro de usuario
router.post(
    '/register',
    [
        check('email', 'El correo es obligatorio').isEmail(),
        check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
        validarCampos
    ],
    registerUser
);

// Inicio de sesión
router.post(
    '/login',
    [
        check('email', 'El correo es obligatorio').isEmail(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validarCampos
    ],
    loginUser
);

export default router;
