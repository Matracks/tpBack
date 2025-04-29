const express = require('express');
const router = express.Router();
const {
  listAllRentals,
  createRentals,
  cancelRental,
  getProductTimes,
  releaseUnpaidRentals,
  updatePaymentStatus,
} = require('../controllers/RentalController');


router.get('/', listAllRentals); // Listo todas las reservas  
router.get('/:productId/:date', getProductTimes); // Listo los horarios ocupados de un producto en un día específico
router.post('/', createRentals); // Crear una nueva reserva
router.post('/release-unpaid', releaseUnpaidRentals); // Liberar reservas no pagadas
router.patch('/:id', cancelRental); // Cancelar una reserva por ID
router.put('/unpaid/:id', updatePaymentStatus); // Actualizar el estado de pago de una reserva por número de documento del usuario

module.exports = router;