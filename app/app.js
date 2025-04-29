const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productRoutes = require('./routes/ProductRoutes');
const rentalRoutes = require('./routes/RentalRoutes');

const app = express();

app.use(bodyParser.json());

// Endpoints
app.use('/products', productRoutes);
app.use('/rentals', rentalRoutes);

// Rutas
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API!');
});

// Exportar la aplicación
module.exports = app;