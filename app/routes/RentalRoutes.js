const express = require('express');
const router = express.Router();
const {
  listAllRentals,
  createRentals,
  cancelRentalStorm,
  getRentalById,
  getProductTimes,
  releaseUnpaidRentals,
  updatePaymentStatus,
  cancelRental,
  listTodayRentals
} = require('../controllers/RentalController');


router.get('/', listAllRentals); // Listo todas las reservas
router.get('/today', listTodayRentals); // Listar reservas del día actual
router.get('/:productId/:date', getProductTimes); // Listo los horarios ocupados de un producto en un día específico
router.get('/:id', getRentalById); // Buscar reserva por id
router.post('/', createRentals); // Crear una nueva reserva
router.patch('/cancel/:id', cancelRental);
router.post('/release-unpaid', releaseUnpaidRentals); // Liberar reservas no pagadas
router.patch('/storm/:id', cancelRentalStorm); // Cancelar una reserva por ID
router.put('/unpaid/:id', updatePaymentStatus); // Actualizar el estado de pago de una reserva por número de documento del usuario

module.exports = router;