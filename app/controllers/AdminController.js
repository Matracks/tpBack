const Admin = require('../models/AdminModel');

// Crear un nuevo admin
const createAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send({ message: 'Nombre y contraseña son requeridos.' });
    }
    const newAdmin = new Admin({ name, password });
    await newAdmin.save();
    res.status(201).send({ success: 'Admin creado exitosamente.' });
  } catch (error) {
    res.status(500).send({ error: 'Error al crear el admin.', error });
  }
};

// Verificar credenciales de admin
const verifyAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Admin.findOne({ name, password });
    if (!admin) {
      return res.status(401).send({ message: 'Credenciales inválidas.' });
    }
    res.status(200).send({ success: 'Acceso concedido.' });
  } catch (error) {
    res.status(500).send({ error: 'Error al verificar el admin.', error });
  }
};

module.exports = {
  createAdmin,
  verifyAdmin
};