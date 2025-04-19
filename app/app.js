const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productRoutes = require('./routes/ProductRoutes');

const app = express();

app.use(bodyParser.json());

// Endpoints
app.use('/products', productRoutes);

// Rutas
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API!');
});

// Exportar la aplicación
module.exports = app;