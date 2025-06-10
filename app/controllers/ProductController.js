const Product = require('../models/ProductModel');

// Obtener todos los productos
const listAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener los productos', error });
  }
};

// Obtener un producto por ID
const listProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Producto no encontrado' });
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el producto', error });
  }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    res.status(400).send({ error: 'Error al crear el producto', error });
  }
};

// Actualizar un producto por ID
const updateProduct = async (req, res) => {
  try {
    // Verificar si el campo "family" viene en el req.body
    if (req.body.family && !['JetSky', 'Cuatriciclos', 'Equipo de buceo', 'Tabla de surf niños', 'Tabla de surf adultos'].includes(req.body.family)) {
      return res.status(400).send({ error: 'El campo "family" no es válido' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).send({ error: 'Producto no encontrado' });
    }
    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(400).send({ error: 'Error al actualizar el producto', error });
  }
};

// Eliminar un producto por ID
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }
    res.status(200).send({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).send({ error: 'Error al eliminar el producto', error });
  }
};

// Listar productos por familia
const listProductsByFamily = async (req, res) => {
  try {
    const { family } = req.params;
    const products = await Product.find({ family });
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener los productos por familia', error });
  }
};

module.exports = {
  listAllProducts,
  listProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listProductsByFamily
};