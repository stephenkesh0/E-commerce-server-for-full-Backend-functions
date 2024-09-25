const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Middleware to check for authentication (General)
const protect = async (request, response, next) => {
  let token;
  if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
    try {
      // The space between the split is very important i.e space inbetween " "
      token = request.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      request.user = await User.findById(decoded.id).select("-password")

      if (!request.user) {
        return response.status(401).json({message : "Not authorised, User not found"})
      }
      next()
    } catch (error) {
      return response.status(401).json({message : "Not authorised, Token failed"})
    }
  }else{
    return response.status(401).json({message : "Not authorised, No token"})
  }
}


// Middleware to check for authenticated Admin users
// Note you dont use "async" while checking for Admin
const admin = (request, response, next) => {
  if (request.user && request.user.isAdmin) {
    next()
  }else{
    return response.status(403).json({message : "Not authorised as an Admin"})
  }
}





module.exports = {protect, admin}