const Rental = require('../models/RentalModel');
const Product = require('../models/ProductModel');

// Obtener todos los alquileres
const listAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find().populate('products.product'); // Se obtiene la información del producto relacionado
    res.status(200).send(rentals);
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los alquileres', error });
  }
};

// Crear un nuevo alquiler
const createRental = async (req, res) => {
  try {
    const { products, startTime, turns, paymentMethod } = req.body;

    // Validar que los turnos no excedan 3
    if (turns > 3) {
      return res.status(400).send({ message: 'No se pueden reservar más de 3 turnos consecutivos' });
    }

    // Validar que el turno no sea mayor a 48 horas de anticipación
    const now = new Date();
    const maxStartTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 horas desde ahora
    if (new Date(startTime) > maxStartTime) {
      return res.status(400).send({ message: 'Los turnos no pueden reservarse con más de 48 horas de anticipación' });
    }

    // Calcular descuento si hay más de un producto
    let totalAmount = 0;

    // Calcular el total
    for (let i = 0; i < products.length; i++) {
    totalAmount += products[i].pricePerTurn * products[i].quantity * turns;
    }

    // Aplicar descuento si hay más de un producto
    if (products.length > 1) {
      finalAmount *= 0.9; // 10% de descuento
      discountApplied = 0.1 * totalAmount;
    }

    // Crear el alquiler
    const newRental = new Rental({
      ...req.body,
      totalAmount,
      discountApplied,
      finalAmount
    });

    const savedRental = await newRental.save();
    res.status(201).send(savedRental);
  } catch (error) {
    res.status(400).send({ message: 'Error al crear el alquiler', error });
  }
};

// Cancelar un alquiler
const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).send({ message: 'Alquiler no encontrado' });
    }

    const now = new Date();
    const cancellationLimit = new Date(rental.startTime.getTime() - 2 * 60 * 60 * 1000); // 2 horas antes del turno
    if (now > cancellationLimit) {
      return res.status(400).send({ message: 'El alquiler no puede cancelarse con menos de 2 horas de anticipación' });
    }

    rental.paymentStatus = 'cancelado';
    rental.cancellationTime = now;
    await rental.save();

    res.status(200).send({ message: 'Alquiler cancelado correctamente', rental });
  } catch (error) {
    res.status(400).send({ message: 'Error al cancelar el alquiler', error });
  }
};


module.exports = {
  listAllRentals,
  createRental,
  cancelRental,
};