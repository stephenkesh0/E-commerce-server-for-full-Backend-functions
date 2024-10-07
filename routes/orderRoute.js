const express = require("express");
const { createOrder, getOrderById, updateOrderToPaid, updateOrderToDelivered, getMyOrders, getAllOrders, createCheckout } = require("../controller/orderController");

const router = express.Router()


router.post('/createOrder', createOrder)

router.get('/:orderId', getOrderById)

router.put('/:orderId/paid', updateOrderToPaid)

router.put('/:orderId/delivered', updateOrderToDelivered)

router.get('/myorders/:customerId', getMyOrders)

router.get('/', getAllOrders)

router.post('/checkout', createCheckout)






module.exports = router