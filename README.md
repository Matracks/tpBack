# TP Back - Sistema de Alquiler

Este proyecto es una API para gestionar el sistema de alquiler de productos como JetSky, Cuatriciclos, y otros equipos. Permite realizar operaciones CRUD para productos y alquileres, además de aplicar reglas específicas para la gestión de turnos y pagos.

## Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework para construir la API.
- **MongoDB**: Base de datos NoSQL para almacenar productos y alquileres.
- **Mongoose**: ODM para interactuar con MongoDB.
- **Nodemon**: Herramienta para reiniciar automáticamente el servidor durante el desarrollo.

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (gestor de paquetes de Node.js)
- **MongoDB Atlas** (o una instancia local de MongoDB)

---

## Instalación

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone https://github.com/Matracks/tpBack.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd tpBack
   ```

3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

4. Configura las variables de entorno:
   - Pega el archivo `.env` en la raíz del proyecto.
---

## Uso

### Iniciar el servidor

Para iniciar el servidor en modo desarrollo con **Nodemon**:
```bash
npm run dev
```

Para iniciar el servidor en modo producción:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`.

---

## Endpoints de la API

### Productos

- **GET /products**: Obtiene todos los productos.
- **GET /products/:id**: Obtiene un producto por su ID.
- **POST /products**: Crea un nuevo producto.
- **PUT /products/:id**: Actualiza un producto por su ID.
- **DELETE /products/:id**: Elimina un producto por su ID.

### Alquileres

- **GET /rentals**: Obtiene todos los alquileres.
- **GET /rentals/:id/:date**: Obtiene un alquiler por su ID.
- **POST /rentals**: Crea un nuevo alquiler.
- **POST /rentals/release-unpaid**: Libera los efectivos pendientes con 2hs de tiempo.
- **PATCH /rentals/:id**: Cancela un alquiler por su ID.
- **PUT /rentals/unpaid/:id**: Actualiza el estado de un pago.

---

## Reglas de negocio

1. **Dispositivos de seguridad**:
   - Los productos como JetSky y Cuatriciclos requieren cascos y chalecos salvavidas.

2. **Duración del turno**:
   - Cada turno dura 30 minutos.
   - Un cliente puede reservar hasta 3 turnos consecutivos.

3. **Descuento**:
   - Si se alquilan más de un producto, se aplica un descuento del 10% al total.

4. **Anticipación**:
   - Los turnos pueden reservarse con un máximo de 48 horas de anticipación.

5. **Cancelación**:
   - Los turnos pueden cancelarse sin costo hasta 2 horas antes del inicio.

6. **Pago en efectivo**:
   - Si el pago es en efectivo, debe realizarse al menos 2 horas antes del turno, de lo contrario, el turno se libera.

---

## Pruebas

Puedes usar herramientas como **Postman** o **Thunder Client** para probar los endpoints de la API. Asegúrate de que el servidor esté corriendo antes de realizar las solicitudes.

---

## Notas para la profesora

- El archivo `.env` no está incluido en el repositorio por razones de seguridad. Se adjuntara.
- Si tiene alguna pregunta o encuentra algún problema, no dude en contactarme.