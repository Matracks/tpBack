const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['JetSky', 'Cuatriciclos', 'Equipo de buceo', 'Tabla de surf niños', 'Tabla de surf adultos']
  },
  description: String,
  pricePerTurn: {
    type: Number,
    required: true,
    min: 0
  },
  requiresSafetyDevices: {
    type: Boolean,
    default: false
  },
  maxPeople: {
    type: Number,
    default: 1
  },
  available: {
    type: Boolean,
    default: true
  },
  imageUrl: String
}, { timestamps: true }); // Crea un campo de fecha de creación y actualización automáticamente

module.exports = mongoose.model('Product', productSchema);