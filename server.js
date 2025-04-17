
const Database = require('./app/config/database');
const CONFIG = require('./app/config/config');
const app = require('./app/app');

Database.connect();

app.listen(CONFIG.PORT, err => {
    if (err) return console.log(err)
    console.log(`Servidor corriendo en el puerto: ${CONFIG.PORT}`);
})