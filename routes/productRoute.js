const express = require("express");
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, getTopProducts } = require("../controller/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router()


router.post('/createProduct',protect, admin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createProduct);

router.get('/getAllProducts', getAllProducts)

router.get('/getSingleProduct', getSingleProduct)

router.put('/updateProduct', updateProduct)

router.delete('/deleteProduct/:id', deleteProduct)

router.get('/getTopProducts', getTopProducts)








module.exports = router