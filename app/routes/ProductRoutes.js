const express = require('express');
const router = express.Router();
const {
  listAllProducts,
  listProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listProductsByFamily
} = require('../controllers/ProductController');


router.get('/', listAllProducts);
router.get('/:id', listProductById);
router.get('/family/:family', listProductsByFamily);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;