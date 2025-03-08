import { response, request } from 'express';
import User from '../users/user.model.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export const registerUser = async (req = request, res = response) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, msg: 'Usuario ya existe' });
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'CLIENT',
        });

        await newUser.save();
        res.status(201).json({ success: true, msg: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Error al registrar usuario', error });
    }
};

export const loginUser = async (req = request, res = response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, msg: 'Correo o contraseña incorrectos' });
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({ success: false, msg: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign({ uid: user._id, role: user.role }, process.env.SECRETORPRIVATEKEY, { expiresIn: '1h' });
        res.json({ success: true, msg: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ 
            success: false, 
            msg: 'Error al iniciar sesión', 
            error: process.env.NODE_ENV === 'development' ? error.stack : {} 
        });
    }
};
