const Rental = require('../models/RentalModel');
const Product = require('../models/ProductModel'); // Asegúrate de importar el modelo de productos


// Obtener todos los alquileres
const listAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find().populate('product'); // Obtener información del producto relacionado
    res.status(200).send(rentals);
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener las resevas', error });
  }
};

// Crear múltiples alquileres
const createRentals = async (req, res) => {
  try {
    const rentals = req.body; // Array de reservas enviado desde el frontend

    // Validar que sea un array
    if (!Array.isArray(rentals) || rentals.length === 0) {
      return res.status(400).send({ message: 'Debe enviar un array de reservas.' });
    }

    let hasDifferentProducts = false; // Bandera para verificar si hay productos diferentes

    if(rentals.length > 1){
      for (let i = 1; i < rentals.length; i++) {
        const currentProduct = rentals[i].product;
        const previousProduct = rentals[i - 1].product;
  
        // Comparar el producto actual con el producto anterior
        if (currentProduct !== previousProduct) {
          hasDifferentProducts = true; // Si son diferentes, establecemos la bandera
          break; // Salimos del bucle porque ya sabemos que hay productos diferentes
        }
      }
    }

    for (const rentalData of rentals) {
      const { product, startTime, customerInfo, paymentMethod } = rentalData;

      // Verificar que el producto exista
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).send({ message: `El producto con ID ${product} no existe.` });
      }

      // Validar que el precio por turno sea igual al que viene del frontend
      if (productExists.pricePerTurn !== totalAmount) {
        return res.status(400).send({
          message: `El precio por turno para el producto con ID ${product} no coincide. Precio esperado: ${productExists.pricePerTurn}, precio recibido: ${totalAmount}.`,
        });
      }

      // Si se requeiren dispositivos de seguridad
      if(productExists.requiresSafetyDevices) {
        totalAmount += productExists.safetyDevicesPrice; // Sumar el precio de los dispositivos de seguridad al total
      }

      // Validar que el turno no sea mayor a 48 horas de anticipación
      const now = new Date();
      const maxStartTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 horas desde ahora
      if (new Date(startTime) > maxStartTime) {
        return res.status(400).send({ message: 'Los turnos no pueden reservarse con más de 48 horas de anticipación.' });
      }

      // Verificar disponibilidad del producto en el horario solicitado
      const checkProductTime = await Rental.findOne({
        product,
        startTime: new Date(startTime),
        paymentStatus: { $ne: 'cancelado' }, // Excluir reservas canceladas
      });

      if (checkProductTime) {
        return res.status(400).send({
          message: `El producto con ID ${product} ya está reservado para el horario ${startTime}.`,
        });
      }

      if(paymentMethod === 'tarjeta') {
        rentalData.paymentStatus = 'pagado'; // Cambiar el estado de pago a pagado si es tarjeta
      }

      if(hasDifferentProducts) {
        rentalData.discountApplied = rentalData.totalAmount * 0.10; // Guardar el descuento aplicado
        rentalData.totalAmount *= 0.9; // Aplicar un 10% de descuento si hay productos diferentes
      }
    }

    // Si todas las validaciones pasan, guardar las reservas
    const savedRentals = [];
    for (const rentalData of rentals) {

      // Crear la reserva
      const newRental = new Rental(rentalData);
      const savedRental = await newRental.save();
      savedRentals.push(savedRental);
    }

    res.status(201).send({
      message: 'Reservas creadas exitosamente.',
      rentals: savedRentals,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error al crear las reservas.', error });
  }
};

// Cancelar una reserva
const cancelRental = async (req, res) => {
  try {
    const { id } = req.params; // ID de la reserva a cancelar
    const { cancellationReason, isStormCancellation } = req.body;

    // Buscar la reserva por ID
    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }

    // Validar si el turno ya pasó
    const now = new Date();
    if (new Date(rental.startTime) <= now) {
      return res.status(400).send({ message: 'No se puede cancelar una reserva cuyo turno ya ha pasado.' });
    }

    // Actualizar el estado de la reserva
    rental.cancellationTime = now; // Registrar la fecha y hora de cancelación
    rental.isStormCancellation = isStormCancellation || false; // Indicar si fue por tormenta
    if(isStormCancellation) {
      rental.paymentStatus = 'reembolsado_parcial'; // Cambiar el estado de pago a reembolsado parcial si fue por tormenta
      rental.cancellationReason = "Tormenta"; // Establecer el motivo de la cancelación
    } else {
      rental.paymentStatus = 'cancelado'; // Cambiar el estado de pago a cancelado
      rental.cancellationReason = cancellationReason || 'Sin especificar'; // Establecer el motivo de la cancelación
    }

    await rental.save();

    res.status(200).send({
      message: 'Reserva cancelada exitosamente.',
      rental,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error al cancelar la reserva.', error });
  }
};

// Obtener horarios ocupados para un producto en un día específico
const getProductTimes = async (req, res) => {
  try {
    const { productId, date } = req.params; // ID del producto y día recibido como parámetros

    // Validar que se envíen ambos parámetros
    if (!productId || !date) {
      return res.status(400).send({ message: 'Debe proporcionar el ID del producto y el día.' });
    }

    // Convertir el día recibido a un rango de inicio y fin (00:00 a 23:59 del día)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0); // Inicio del día en UTC
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999); // Fin del día en UTC

    // Buscar reservas del producto en el rango del día
    const rentals = await Rental.find({
      product: productId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: { $ne: 'cancelado' }, // Excluir reservas canceladas
    }).select('startTime -_id'); // Solo obtener el campo startTime

    // Extraer los horarios ocupados
    const productTimes = rentals.map(rental => rental.startTime);

    res.status(200).send({
      message: 'Horarios ocupados obtenidos exitosamente.',
      productTimes,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los horarios ocupados.', error });
  }
};

module.exports = {
  listAllRentals,
  createRentals,
  cancelRental,
  getProductTimes,
};