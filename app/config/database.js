const mongoose = require('mongoose');

// Configuración de la conexión a MongoDB Atlas
const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.set('strictQuery', true);

const connect = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI, clientOptions);
        console.log("Conexión exitosa a MongoDB Atlas");
    } catch (error) {
        console.error("Error al conectar con MongoDB Atlas:", error.message);
        process.exit(1); // Salir del proceso si no se puede conectar
    }
};

module.exports = { connect };
