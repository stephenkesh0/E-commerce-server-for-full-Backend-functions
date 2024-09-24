const jwt = require("jsonwebtoken")

require("dotenv").config()

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn : "30d"
  });
};








// This is where we export the function we created above 
module.exports = generateToken