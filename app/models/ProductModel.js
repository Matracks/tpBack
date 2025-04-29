const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  family: {
    type: String,
    required: true,
    enum: ['JetSky', 'Cuatriciclos', 'Equipo de buceo', 'Tabla de surf niños', 'Tabla de surf adultos']
  },
  name: {
    type: String,
    required: true,
    unique: true
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
  safetyDevicesPrice: {
    type: Number,
    default: 0
  },
  maxPeople: {
    type: Number,
    default: 1
  },
  imageUrl: String
}, { timestamps: true }); // Agrega automáticamente createdAt y updatedAt

module.exports = mongoose.model('Product', productSchema);