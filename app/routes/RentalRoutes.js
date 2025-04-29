const express = require('express');
const router = express.Router();
const {
  listAllRentals,
  createRentals,
  cancelRental,
  getProductTimes
} = require('../controllers/RentalController');


router.get('/', listAllRentals); // Listo todas las reservas  
router.get('/product-times/:productId/:date', getProductTimes); // Listo los horarios ocupados de un producto en un día específico
// router.get('/:id', listProductById);
router.post('/', createRentals); // Crear una nueva reserva
// router.put('/:id', updateProduct);
router.patch('/:id', cancelRental); // Cancelar una reserva por ID

module.exports = router;