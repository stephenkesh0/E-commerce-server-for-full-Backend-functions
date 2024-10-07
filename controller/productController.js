const Product = require("../models/productModel")



// createProduct Function
const createProduct = async (request, response) => {
    const { name, price, description, category, brand, stock, rating } = request.body;

    // Get the uploaded files
    const image = request.files['image'] ? request.files['image'][0].filename : null; // single image
    const images = request.files['images'] ? request.files['images'].map(file => file.filename) : []; // multiple images

    // Check if the required fields are filled
    if (!name || !price || !description || !category || !brand || !stock || !rating) {
        return response.status(401).json({ message: "All mandatory fields are required" });
    }

    // Create product object
    const product = new Product({
        name,
        price,
        description,
        category,
        brand,
        stock,
        rating,
        image,  // can be null
        images  // can be empty array
    });

    try {
        // Save the product in the database
        await product.save();
        console.log('Request Body:', request.body);
        console.log('Files:', request.files);

        response.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        response.status(500).json({ message: "Error creating product", error: error.message });
    }
};
  



// getAllProduct Function
const getAllProducts = async (request, response) => {
    try {
        const products = await Product.find(); // Fetch all products from the DB
        if (products && products.length > 0) {
            response.status(200).json({ message: 'Products fetched successfully', products });
        } else {
            response.status(404).json({ message: 'No products found' });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        response.status(500).json({ error: 'Server error, please try again later' });
    }
};



// getSingleProduct Function
const getSingleProduct = async (request, response) => {
    const { name } = request.body;

    // Check if the product name is provided
    if (!name) {
        return response.status(400).json({ message: "You have to pass in a product name" });
    }

    try {
        // Search for products with the provided name
        const products = await Product.find({ name });

        // Check if any products are found
        if (products.length === 0) {
            return response.status(404).json({ message: `No products found with the name "${name}"` });
        }

        // Return the found products
        response.status(200).json({
            message: `Products found with name: ${name}`,
            products: products.map(product => ({
                name: product.name,
                price: product.price,
            })),
        });
    } catch (error) {
        console.error("Error finding products:", error);
        response.status(500).json({ message: "Server error, please try again later" });
    }
};



// updateProduct Function
const updateProduct = async (request, response) => {
    const { name, price, description } = request.body;

    // Check if the product name is provided
    if (!name) {
        return response.status(400).json({ message: "You have to pass in a product name" });
    }

    // Prepare the fields to update (only include fields that are provided)
    const updateFields = {};
    if (price) updateFields.price = price;
    if (description) updateFields.description = description;

    try {
        // Find and update the product with the provided name
        const product = await Product.findOneAndUpdate(
            { name },                    // Filter to find the product by name
            { $set: updateFields },       // Update the product with the provided fields
            { new: true }                 // Return the updated document
        );

        // Check if the product exists
        if (!product) {
            return response.status(404).json({ message: `No product found with the name "${name}"` });
        }

        // Return the updated product details
        response.status(200).json({
            message: `Product with name: ${name} has been updated successfully`,
            updatedProduct: {
                name: product.name,
                price: product.price,
                description: product.description
            },
        });
    } catch (error) {
        console.error("Error updating product:", error);
        response.status(500).json({ message: "Server error, please try again later" });
    }
};




// deleteProduct Function
const deleteProduct = async (request, response) => {
    const { id } = request.params;  // Get the product ID from the URL parameters

    // Check if the product ID is provided
    if (!id) {
        return response.status(400).json({ message: "You have to pass in a product ID" });
    }

    try {
        // Find and delete the product by ID
        const product = await Product.findByIdAndDelete(id);

        // Check if the product exists
        if (!product) {
            return response.status(404).json({ message: `No product found with the ID "${id}"` });
        }

        // Return success message after deletion
        response.status(200).json({ message: `Product with ID: ${id} has been deleted successfully` });
    } catch (error) {
        console.error("Error deleting product:", error);
        response.status(500).json({ message: "Server error, please try again later" });
    }
};



// getTopProducts
const getTopProducts = async (request, response) => {
    try {
      // Fetch top products based on rating, sort in descending order and limit the results
      const topProducts = await Product.find()
        .sort({ rating: 1 }) // Sort by rating in descending order
        .limit(10); // Adjust the limit as needed
  
      // Check if there are any products found
      if (topProducts.length === 0) {
        return response.status(404).json({ message: 'No top products found' });
      }
  
      // Respond with the top products
      response.status(200).json(topProducts);
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: 'Server Error' });
    }
  };


module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, getTopProducts };