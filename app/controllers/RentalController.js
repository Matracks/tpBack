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

// Listar reservas del día de hoy
const listTodayRentals = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const rentals = await Rental.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: { $ne: 'cancelado' }
    }).populate('product');
    console.log(rentals);
    res.status(200).send(rentals);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener las reservas del día.', error });
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

    // Agrupar turnos por producto y cliente
    const productTurnMap = {}; // Mapa para agrupar turnos por producto y cliente

    for (const rentalData of rentals) {
      const { product, startTime, customerInfo, paymentMethod, totalAmount, persons } = rentalData;

      // Verificar que el producto exista
      const productExists = await Product.findById(product);

      if (!productExists) {
        return res.status(404).send({ message: `El producto con ID ${product} no existe.` });
      }

      const key = `${product}-${customerInfo.idNumber}`; // Clave única por producto y cliente
      if (!productTurnMap[key]) {
        productTurnMap[key] = [];
      }

      // Agregar el turno enviado desde el frontend al mapa
      productTurnMap[key].push(new Date(startTime));
      
      // Si se requeiren dispositivos de seguridad
      if(productExists.requiresSafetyDevices) {
        // Validar que el precio por turno sea igual al que viene del frontend
        expectedPrice = productExists.pricePerTurn + productExists.safetyDevicesPrice * persons;
        if (expectedPrice !== totalAmount) {
          return res.status(400).send({
            error: `El precio por turno para el producto con ID ${product} no coincide. Precio esperado: ${expectedPrice}, precio recibido: ${rentalData.totalAmount}.`,
          });
        }
      }

      // Validar que el turno no sea mayor a 48 horas de anticipación
      const now = new Date();
      const maxStartTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 horas desde ahora
      if (new Date(startTime) > maxStartTime) {
        return res.status(400).send({ error: 'Los turnos no pueden reservarse con más de 48 horas de anticipación.' });
      }

      // Verificar disponibilidad del producto en el horario solicitado
      const checkProductTime = await Rental.findOne({
        product,
        startTime: new Date(startTime),
        paymentStatus: { $ne: 'cancelado' }, // Excluir reservas canceladas
      });

      if (checkProductTime) {
        return res.status(400).send({
          error: `El producto con ID ${product} ya está reservado para el horario ${startTime}.`,
        });
      }

      if(paymentMethod === 'tarjeta') {
        rentalData.paymentStatus = 'pagado'; // Cambiar el estado de pago a pagado si es tarjeta
      }

      if(hasDifferentProducts) {
        rentalData.discountApplied = rentalData.totalAmount * 0.10; // Guardar el descuento aplicado
        rentalData.finalAmount = rentalData.totalAmount - rentalData.discountApplied; // Aplicar un 10% de descuento si hay productos diferentes
      } else {
        if (rentalData.discountApplied && rentalData.discountApplied > 0) {
          return res.status(400).send({
            message: 'No se puede aplicar un descuento si los productos no son diferentes.',
          });
        }
        rentalData.finalAmount = rentalData.totalAmount; // Si no hay productos diferentes, el monto final es igual al total
      }
    }

        // Validar consecutividad para cada producto y cliente
        for (const key in productTurnMap) {
          const turnTimes = productTurnMap[key];
    
          // Ordenar los turnos por fecha
          turnTimes.sort((a, b) => a - b);
    
          // Verificar si hay más de 3 turnos consecutivos
          let consecutiveCount = 1;
          for (let i = 1; i < turnTimes.length; i++) {
            const diff = (turnTimes[i] - turnTimes[i - 1]) / (1000 * 60); // Diferencia en minutos
            if (diff === 30) {
              consecutiveCount++;
              if (consecutiveCount > 3) {
                const productId = key.split('-')[0];
                const product = await Product.findById(productId);
                const productName = product ? product.name : productId;
                return res.status(400).send({
                  error: `No se pueden tomar más de 3 turnos consecutivos para el producto con ID ${productName}.`,
                });
              }
            } else {
              consecutiveCount = 1; // Reiniciar el contador si no son consecutivos
            }
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
    res.status(500).send({ error: 'Error al crear las reservas.', error });
  }
};

// Obtener una reserva por ID
const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id).populate('product');
    if (!rental) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }
    res.status(200).send(rental);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener la reserva.', error });
  }
};

// Cancelar una reserva, sin costo hasta 2 horas antes del turno.
const cancelRental = async (req, res) => {
  try {
    const { id } = req.params; // ID de la reserva a cancelar
    
    const { cancellationReason } = 'Sin especificar'

    // Buscar la reserva por ID
    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).send({ error: 'Reserva no encontrada.' });
    }

    // Validar si el turno ya pasó
    const now = new Date();
    if (new Date(rental.startTime) <= now) {
      return res.status(400).send({ error: 'No se puede cancelar una reserva cuyo turno ya ha pasado.' });
    }

    // Validar si la cancelación es con menos de 2 horas de anticipación
    const twoHoursBefore = new Date(rental.startTime.getTime() - 2 * 60 * 60 * 1000); // 2 horas antes del turno
    if (now > twoHoursBefore) {
      return res.status(400).send({
        error: 'No se puede cancelar la reserva con menos de 2 horas de anticipación.',
      });
    }

    // Actualizar el estado de la reserva
    rental.cancellationTime = now; // Registrar la fecha y hora de cancelación
    rental.paymentStatus = 'cancelado'; // Cambiar el estado de pago a cancelado
    rental.cancellationReason = cancellationReason || 'Sin especificar'; // Establecer el motivo de la cancelación

    await rental.save();

    res.status(200).send({
      message: 'Reserva cancelada exitosamente.',
      rental,
    });
  } catch (error) {
    res.status(500).send({ error: 'Error al cancelar la reserva.', error });
  }
};

// Cancelar reserva por tormenta
const cancelRentalStorm = async (req, res) => {
  try {
    const { id } = req.params; // ID de la reserva a cancelar

    // Buscar la reserva por ID y si no existe devuelve un mensaje
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }

    // Validar si el turno ya pasó
    const now = new Date();
    if (new Date(rental.startTime) <= now) {
      return res.status(400).send({ error: 'No se puede cancelar una reserva cuyo turno ya ha pasado.' });
    }

    // Validar si la cancelación es por tormenta
    if (rental.isStormCancellation) {
      return res.status(400).send({ error: 'La reserva ya ha sido cancelada por tormenta.' });
    }
    // Actualizar el estado de la reserva
    rental.cancellationTime = now;
    rental.isStormCancellation = true;
    rental.paymentStatus = 'reembolsado_parcial';
    rental.cancellationReason = "Tormenta imprevista";
    rental.finalAmount = rental.finalAmount * 0.5; // Aplico el 50% de reembolso

    await rental.save();

    res.status(200).send({
      message: 'Reserva cancelada por tormenta. Se reembolsa el 50% del valor abonado.',
      finalAmount: rental.finalAmount,
      rental,
    });
  } catch (error) {
    res.status(500).send({ error: 'Error al cancelar la reserva por tormenta.', error });
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

// Liberar turnos no pagados
const releaseUnpaidRentals = async (req, res) => {
  try {
    const now = new Date();

    // Buscar reservas con método de pago en efectivo, estado pendiente y con menos de 2 horas para el turno
    const rentalsToRelease = await Rental.find({
      paymentMethod: { $in: ['efectivo_local', 'efectivo_extranjero'] },
      paymentStatus: 'pendiente',
      startTime: { $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) } // Turnos dentro de las próximas 2 horas
    });

    for (const rental of rentalsToRelease) {
      rental.paymentStatus = 'cancelado'; // Cambiar el estado a cancelado
      rental.cancellationReason = 'Liberado por falta de pago'; // Motivo de la cancelación
      rental.cancellationTime = now; // Registrar la fecha y hora de cancelación
      await rental.save();
    }

    res.status(200).send({
      message: `Se liberaron ${rentalsToRelease.length} reservas no pagadas.`,
      rentals: rentalsToRelease,
    });
  } catch (error) {
    res.status(500).send({ error: 'Error al liberar reservas no pagadas.', error });
  }
};

// Actualizar el estado de pago de un alquiler a "pagado"
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // id del alquiler

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).send({
        message: 'No se encontró un alquiler con el ID proporcionado.',
      });
    }

    // Actualizar el estado de pago a "pagado"
    rental.paymentStatus = 'pagado';
    await rental.save();

    res.status(200).send({
      message: 'El estado de pago se actualizó correctamente a "pagado".',
      rental,
    });
  } catch (error) {
    res.status(500).send({ error: 'Error al actualizar el estado de pago.', error });
  }
};

module.exports = {
  listAllRentals,
  createRentals,
  cancelRentalStorm,
  getRentalById,
  getProductTimes,
  releaseUnpaidRentals,
  updatePaymentStatus,
  cancelRental,
  listTodayRentals
};