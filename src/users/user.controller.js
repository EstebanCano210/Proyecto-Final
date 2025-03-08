import { response, request } from 'express';
import User from './user.model.js';
import argon2 from 'argon2';

export const getUsers = async (req = request, res = response) => {
  try {
    const users = await User.find({ estado: true }).select('-password');
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al obtener usuarios',
      error
    });
  }
};

export const updateUserProfile = async (req = request, res = response) => {
  try {
    const userId = req.user.uid;
    const { username, email, password } = req.body;

    const updateData = { username, email };

    if (password) {
      updateData.password = await argon2.hash(password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password');

    res.status(200).json({
      success: true,
      msg: 'Perfil actualizado',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al actualizar perfil',
      error
    });
  }
};

export const changeUserRole = async (req = request, res = response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'CLIENT'].includes(role)) {
      return res.status(400).json({
        success: false,
        msg: 'Rol inválido'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true })
      .select('-password');

    res.status(200).json({
      success: true,
      msg: 'Rol actualizado',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al cambiar rol',
      error
    });
  }
};

export const deleteUser = async (req = request, res = response) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { estado: false }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'Usuario no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      msg: 'Usuario eliminado (soft delete)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error al eliminar usuario',
      error
    });
  }
};
