const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productRoutes = require('./routes/ProductRoutes');
const rentalRoutes = require('./routes/RentalRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const cors = require('cors');


const app = express();

app.use(bodyParser.json());
app.use(cors());

// Endpoints
app.use('/products', productRoutes);
app.use('/rentals', rentalRoutes);
app.use('/admin', adminRoutes);

// Rutas
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API!');
});

// Exportar la aplicación
module.exports = app;