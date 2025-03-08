import User from '../src/users/user.model.js';
import argon2 from 'argon2';

export const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'ADMIN' });
    const usernameExists = await User.findOne({ username: 'admin' });

    if (adminExists || usernameExists) {
      console.log('⚠️ Ya existe un administrador o el username "admin" está en uso. No se creará otro.');
      return;
    }

    const hashedPassword = await argon2.hash('l@_contra');

    const admin = new User({
      username: 'admin',
      email: 'ecano@gmail.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    await admin.save();
    console.log('✅ Administrador creado automáticamente:', admin);
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
  }
};
