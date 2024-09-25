// This is where we will be defining all the endpoints or links 
// Users endpoins will be defined here 
const express = require("express")
const { registerUser, registerAdmin, loginUser, loginAdmin, forgotPassword, resetPassword, getAllUsers, getSingleUser, updateUserProfile, updateAdminProfile } = require("../controller/userController")
const { protect, admin } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/register", registerUser)


router.post("/register/admin", registerAdmin)

router.post("/login", loginUser)

router.post("/login/admin", loginAdmin)


router.post("/forgotPassword", forgotPassword)


router.put("/reset-password/:resetToken", resetPassword)

// To protect a route write protect beside "comma," and make sure it is imported
router.get("/get-all-users",protect,admin, getAllUsers)

router.get('/:id', getSingleUser)

router.put('/:id', updateUserProfile)

router.put('/admin/:id', updateAdminProfile);








module.exports = router