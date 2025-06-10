const express = require('express');
const router = express.Router();
const { createAdmin, verifyAdmin } = require('../controllers/AdminController');

// Crear un nuevo admin
router.post('/', createAdmin);

// Verificar credenciales de admin
router.post('/login', verifyAdmin);

module.exports = router;