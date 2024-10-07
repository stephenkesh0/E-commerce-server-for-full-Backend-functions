const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// createOrder Function
const createOrder = async (request, response) => {
  try {
    const { customer, orderItems, shippingAddress, paymentMethod } =
      request.body;

    // Validate input
    if (
      !customer ||
      !orderItems ||
      orderItems.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return response.status(400).json({ message: "All fields are required" });
    }

    // Check if products exist and calculate itemsPrice
    let itemsPrice = 0;
    const productIds = orderItems.map((item) => item.product);
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    // Validate each order item
    for (const item of orderItems) {
      const product = existingProducts.find((prod) =>
        prod._id.equals(item.product)
      );
      if (!product) {
        return response
          .status(404)
          .json({ message: `Product with ID ${item.product} not found` });
      }
      // Calculate total price for items
      itemsPrice += product.price * item.quantity;
    }

    // Calculate shipping price (assumed to be a flat rate for this example)
    const shippingPrice = 10.0; // You can modify this based on your logic

    // Create new order
    const newOrder = new Order({
      customer,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice,
    });

    // Save order to database
    const savedOrder = await newOrder.save();

    return response
      .status(201)
      .json({ message: "Order placed successfully", savedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};



// getOrderById Function
const getOrderById = async (request, response) => {
  try {
    const { orderId } = request.params; // Extract order ID from the request parameters

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // If no order is found, return a 404 error
    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    // Return the order details
    response.status(200).json({ order });
  } catch (error) {
    // If there's an error (e.g., invalid ID format), return a 500 server error
    response
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



// updateOrderToPaid Function
const updateOrderToPaid = async (request, response) => {
  try {
    const { orderId } = request.params; // Extract order ID from the request parameters

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // If no order is found, return a 404 error
    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already delivered
    if (order.isPaid) {
      return response
        .status(400)
        .json({ message: "Order has already been paid for" });
    }

    // Update the order status
    order.isPaid = true; // Set isDelivered to true
    order.deliveredAt = Date.now(); // Set the delivery timestamp

    // Save the updated order
    const updatedOrder = await order.save();

    // Return the updated order details
    response
      .status(200)
      .json({ message: "Order updated to delivered", order: updatedOrder });
  } catch (error) {
    // If there's an error, return a 500 server error
    response
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



// updateOrderToDelivered Function
const updateOrderToDelivered = async (request, response) => {
  try {
    const { orderId } = request.params; // Extract order ID from the request parameters

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // If no order is found, return a 404 error
    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already delivered
    if (order.isDelivered) {
      return response
        .status(400)
        .json({ message: "Order is already delivered" });
    }

    // Update the order status
    order.isDelivered = true; // Set isDelivered to true
    order.deliveredAt = Date.now(); // Set the delivery timestamp

    // Save the updated order
    const updatedOrder = await order.save();

    // Return the updated order details
    response
      .status(200)
      .json({ message: "Order updated to delivered", order: updatedOrder });
  } catch (error) {
    // If there's an error, return a 500 server error
    response
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



// getMyOrders Function
const getMyOrders = async (request, response) => {
  try {
    const { customerId } = request.params; // Extract customer ID from request params (or you could extract it from the authenticated user session)

    // Fetch orders for the given customer ID
    const orders = await Order.find({ customer: customerId }).populate(
      "orderItems.product",
      "name price"
    ); // Assuming product data is populated for better detail

    // If no orders are found, return a 404 error
    if (!orders || orders.length === 0) {
      return response
        .status(404)
        .json({ message: "No orders found for this customer" });
    }

    // Return the list of orders
    return response.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};


// getAllOrders Function
const getAllOrders = async (request, response) => {
  try {
    const order = await Order.find();

    // If no order is found, return a 404 error
    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    if (order && order.length > 0) {
      // Return a successful response with the list of users
      response.status(200).json({
        message: "Orders fetched successfully",
        order,
      });
    } else {
      // Return a message when no users are found
      response.status(404).json({ message: "No Orders found" });
    }
  } catch (error) {
    // If there's an error (e.g., invalid ID format), return a 500 server error
    response.status(500).json({ message: "Server error", error: error.message });
  }
};



// createCheckout Function
const createCheckout = async (request, response) => {
    try {
      const { customer, orderItems, shippingAddress, paymentMethod, taxPrice } = request.body;
  
      // Validate input
      if (!customer || !orderItems || orderItems.length === 0 || !shippingAddress || !paymentMethod) {
        return response.status(400).json({ message: 'All fields are required' });
      }
  
      // Validate that the payment method is allowed
      const allowedPaymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer'];
      if (!allowedPaymentMethods.includes(paymentMethod)) {
        return response.status(400).json({ message: 'Invalid payment method' });
      }
  
      // Check if products exist and calculate itemsPrice
      let itemsPrice = 0;
      const productIds = orderItems.map(item => item.product);
      const existingProducts = await Product.find({ _id: { $in: productIds } });
  
      // Validate each order item
      for (const item of orderItems) {
        const product = existingProducts.find(prod => prod._id.equals(item.product));
        if (!product) {
          return response.status(404).json({ message: `Product with ID ${item.product} not found` });
        }
        // Calculate total price for items
        itemsPrice += product.price * item.quantity;
      }
  
      // Calculate shipping price (assumed to be a flat rate for this example)
      const shippingPrice = 10.00; // Modify this based on your business logic
  
      // Calculate total price (items price + tax + shipping)
      const totalPrice = itemsPrice + taxPrice + shippingPrice;
  
      // Create the order
      const newOrder = new Order({
        customer,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        taxPrice,
      });
  
      // Save the order to the database
      const savedOrder = await newOrder.save();
  
      // Return the order details
      return response.status(201).json({
        message: 'Checkout successful',
        order: savedOrder
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  };












module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getAllOrders,
  createCheckout
};
