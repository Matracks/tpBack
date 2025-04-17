const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    customerInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        idNumber: { type: String, required: true }
    },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  startTime: {
    type: Date,
    required: true
  },
  turns: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo_local', 'efectivo_extranjero', 'tarjeta', 'pendiente'],
    default: 'pendiente'
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'cancelado', 'reembolsado_parcial'],
    default: 'pendiente'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  cancellationTime: Date,
  cancellationReason: String,
  isStormCancellation: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);