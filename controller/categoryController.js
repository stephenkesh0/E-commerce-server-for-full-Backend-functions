const Category = require('../models/categoryModel')


const createCategory = async (request, response) => {
    const { name, parent } = request.body;

    // Check if the 'name' field is provided
    if (!name) {
        return response.status(400).json({ message: "Category name is required" });
    }

    try {
        const category = await Category.create({ name, parent:parent || null });
        return response.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error);
        return response.status(500).json({ message: "Error creating category", error });
    }
};


module.exports = createCategory