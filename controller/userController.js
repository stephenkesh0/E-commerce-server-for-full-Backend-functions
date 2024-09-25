const { request, response } = require("express")
const User = require("../models/userModel")
const generateToken = require("../utils/generateToken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const sendMail = require("../utils/sendMail")


// registerUser function
const registerUser = async (request, response) => {
  const {fullName, email, phone, password} = request.body

  const userExists = await User.findOne({email})

  if (userExists) {
    return response.status(400).json({error : "User already exists...."})
  }

  const user = await User.create({fullName, email, phone, password})
  if (user) {
    const token = generateToken(user._id)

    response.cookie("jwt", token, {
      httpOnly : true,
      sameSite : "strict",
      maxAge : 30*24*60*60*1000,
    })

    response.status(201).json({
      message : "User registered successfully....",
      user,
      token
    })
    
  } else {
    response.status(400).json({error : "Invalid user data"})
  }

}


// registerAdmin function
const registerAdmin = async(request, response) => {
  const {fullName, email, phone, password} = request.body

  const userExists = await User.findOne({email})

  if (userExists) {
    return response.status(400).json({error : "Admin already exists...."})
  }

  const user = await User.create({fullName, email, phone, password, isAdmin:true})
  if (user) {
    const token = generateToken (user._id)

    response.cookie("jwt", token, {
      httpOnly : true,
      sameSite : "strict",
      maxAge : 30*24*60*60*1000,
    })

    response.status(201).json({
      message : "Admin registered successfully....",
      user,
      token
    })
    
  } else {
    response.status(400).json({error : "Invalid user data"})
  }
}



// loginUser function
const loginUser = async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
      res.status(400);
      throw new Error("All fields are mandatory");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id)

    response.cookie("jwt", token, {
      httpOnly : true,
      sameSite : "strict",
      maxAge : 30*24*60*60*1000,
    })

      return response.status(200).json({ message: "Login successfully", 
        token,
        user
      });
  } else {
      response.status(400);
      throw new Error("Username or password is incorrect");
  }
};



// loginAdmin function
const loginAdmin = async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.status(400);
    throw new Error("All fields are mandatory");
  }

  // Find admin by email
  const user = await User.findOne({ email });

  // Check if admin exists and password is correct
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id)

    response.cookie("jwt", token, {
      httpOnly : true,
      sameSite : "strict",
      maxAge : 30*24*60*60*1000,
    })

    return response.status(200).json({ message: "Admin login successful", 
      token,
      user
    });
  } else {
    response.status(400);
    throw new Error("Admin email or password is incorrect");
  }
};



// forgotPassword function
const forgotPassword = async (request, response) => {
  const {email} = request.body

  // check if user exist
  const user = await User.findOne({email})

  if (!user) {
    response.status(404)
    throw new Error("User not found")
  }

  // generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex")
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  // this is where you set how long the reset token will last
  user.resetPasswordExpire = Date.now() + 10*60*1000

  await user.save()

  const resetUrl = `${request.protocol}://${request.get("host")}/api/user/reset-password/${resetToken}`
  const message = `You are receiving this email because you or someone else has requested a password reset. Please click the following link to reset your password: \n\n ${resetUrl}`

  await sendMail({
    email : user.email,
    subject : "Password reset token",
    message : message
  })

  response.status(200).json({success : true, data : "Reset link sent to email...."})

}



// resetPassword function
const resetPassword = async (request, response) => {
  const { resetToken } = request.params;
  const { password } = request.body;

  // Hash the token from the URL
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Find user by reset token and check if token has not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    response.status(400);
    throw new Error("Invalid or expired token");
  }

  // Set new password
  user.password = password;
  
  // Clear reset token and expiration fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  response.status(200).json({
    success: true,
    data: "Password reset successful"
  });
};



// getAllUsers function
const getAllUsers = async (request, response) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    if (users && users.length > 0) {
      // Return a successful response with the list of users
      response.status(200).json({
        message: "Users fetched successfully",
        users
      });
    } else {
      // Return a message when no users are found
      response.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    // Handle any server errors
    response.status(500).json({ error: "Server error, please try again" });
  }
};


// getSingleUser function
const getSingleUser = async (request, response) => {
  try {
    // Extract user ID from the request parameters
    const userId = request.params.id;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    if (user) {
      // If the user is found, return the user data
      response.status(200).json({
        message: "User fetched successfully",
        user
      });
    } else {
      // If the user is not found, return a 404 status with a message
      response.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // Handle any server or database errors
    response.status(500).json({ error: "Server error, please try again" });
  }
};



// updateUserProfile function
const updateUserProfile = async (request, response) => {
  try {
    // Get the user ID from request parameters (or you can get it from the auth token)
    const userId = request.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (user) {
      // Update the fields if they are provided in the request body
      user.fullName = request.body.fullName || user.fullName;
      user.email = request.body.email || user.email;
      user.phone = request.body.phone || user.phone;
      if (request.body.password) {
        user.password = request.body.password; // Make sure to hash this password before saving
      }

      // Save the updated user to the database
      const updatedUser = await user.save();

      // Respond with the updated user information
      response.status(200).json({
        message: "User profile updated successfully",
        user: updatedUser
      });
    } else {
      // If user is not found, return 404 status
      response.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // Handle any server or database errors
    response.status(500).json({ error: "Server error, please try again" });
  }
};



// updateAdminProfile function
const updateAdminProfile = async (request, response) => {
  try {
    // Get the admin ID from request parameters (or from the auth token)
    const adminId = request.params.id;

    // Find the admin by ID
    const admin = await User.findById(adminId);

    // Check if the user is an admin (assuming your user model has a field `isAdmin`)
    if (!admin || !admin.isAdmin) {
      return response.status(403).json({ message: "Access denied. Admin only" });
    }

    // Update the fields if they are provided in the request body
    admin.fullName = request.body.fullName || admin.fullName;
    admin.email = request.body.email || admin.email;
    admin.phone = request.body.phone || admin.phone;
    if (request.body.password) {
      admin.password = request.body.password; // Make sure to hash this password before saving
    }

    // Save the updated admin profile to the database
    const updatedAdmin = await admin.save();

    // Respond with the updated admin profile
    response.status(200).json({
      message: "Admin profile updated successfully",
      admin: updatedAdmin
    });
  } catch (error) {
    // Handle any server or database errors
    response.status(500).json({ error: "Server error, please try again" });
  }
};





module.exports = {registerUser, registerAdmin, loginUser, loginAdmin, forgotPassword, resetPassword, getAllUsers, getSingleUser, updateUserProfile, updateAdminProfile}