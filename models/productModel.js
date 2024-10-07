const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,  // This field is required
    trim: true       // Automatically trims whitespace from the start and end
},

description: {
    type: String,
    required: true
},

price: {
    type: Number,
    required: true,
    validate(value) {
        if (value < 0) throw new Error('Price must be a positive number');
    }
},

category: {
    type: String,
    required: true,
    trim: true
},

brand: {
    type: String,
    required: true,
    trim: true
},

stock: {
    type: Number,
    required: true,
    min: 0   // Stock cannot be less than 0
},

rating: {
    type: Number,
    default: 1,   // Default value for rating is 1
    min: 1,       // Minimum value for rating is 1
    max: 5        // Maximum value for rating is 5
},


// tracking who created or modified the product
// user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//     },

image: {
    type: String,
    required: false
},
images: [
    {
        type: String,
        required: false

    }
],


}, {
  timestamps : true
});




module.exports = mongoose.model("Product", productSchema)