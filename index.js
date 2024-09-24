// This is our actual server
const express = require("express")
const app = express()
const port = 7578



// importing database function
const connectDb = require("./config/db")
connectDb()


// make sure you always put this function directly under "connectDb" function
// middleware

// this allows us input encoded values in json format
app.use(express.json())



// importing user routes
// const userRoute = require("./routes/userRoute")

// using the user route
app.use("/api/user", require("./routes/userRoute"))

// testing route
app.get("/api", (request, response) => {
  response.json({message:"Welcome to my server...."})
})













app.listen(port, () => {
  console.log("Server connected successfully");
  
})