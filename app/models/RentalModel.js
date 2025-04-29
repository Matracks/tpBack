const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    customerInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        idNumber: { type: String, required: true }
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Relación con el modelo Product
        required: true
    },
    startTime: {
        type: Date,
        required: true // Fecha de inicio del alquiler
    },
    paymentMethod: {
        type: String,
        enum: ['efectivo_local', 'efectivo_extranjero', 'tarjeta', 'pendiente'], // Métodos de pago
        default: 'pendiente'
    },
    paymentStatus: {
        type: String,
        enum: ['pendiente', 'pagado', 'cancelado', 'reembolsado_parcial'], // Estados de pago
        default: 'pendiente'
    },
    totalAmount: {
        type: Number,
        required: true // Monto total del turno
    },
    discountApplied: {
        type: Number,
        default: 0 // Descuento aplicado (si corresponde)
    },
    finalAmount: {
        type: Number,
        required: true // Monto final después de aplicar descuentos
    },
    cancellationTime: {
        type: Date // Fecha de cancelación (si aplica)
    },
    cancellationReason: {
        type: String // Razón de la cancelación (si aplica)
    },
    isStormCancellation: {
        type: Boolean,
        default: false // Indica si la cancelación fue por tormenta
    }
}, { timestamps: true }); // Agrega automáticamente createdAt y updatedAt

module.exports = mongoose.model('Rental', rentalSchema);