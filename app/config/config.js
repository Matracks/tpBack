require('dotenv').config(); // Cargar variables de entorno desde .env

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/defaultdb'
};