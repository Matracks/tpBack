const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());


// Rutas
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API!');
});

// Exportar la aplicación
module.exports = app;