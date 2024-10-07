// This is where we will be defining all the endpoints or links 
// Users endpoins will be defined here 
const express = require("express")
const { registerUser, registerAdmin, loginUser, loginAdmin, forgotPassword, resetPassword, getAllUsers, getSingleUser, updateUserProfile, updateAdminProfile } = require("../controller/userController")
const { protect, admin } = require("../middleware/authMiddleware")

const router = express.Router()

// User routes
router.post("/register", registerUser)

router.post("/login", loginUser)

router.post("/forgotPassword", forgotPassword)

router.put("/reset-password/:resetToken", resetPassword)

router.get('/:id', getSingleUser)

router.put('/:id', updateUserProfile)



// Admin routes
router.post("/register/admin", registerAdmin)

router.post("/login/admin", loginAdmin)

router.put('/admin/:id', updateAdminProfile);

// To protect a route write "protect" beside "comma ," and make sure it is imported
router.get("/",protect,admin, getAllUsers)






module.exports = router