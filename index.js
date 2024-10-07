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


// For Vesel
app.use("/", (request, response) => {
  response.send('server is working')
})
// For userRoute
app.use("/api/users", require("./routes/userRoute"))

// For productRoute
app.use('/api/products', require("./routes/productRoute"))

// For categoryRoute
app.use("/api/categorys", require("./routes/categoryRoute"))

// For orderRoute
app.use("/api/orders", require("./routes/orderRoute"))

// testing route
app.get("/api", (request, response) => {
  response.json({message:"Welcome to my server...."})
})













app.listen(port, () => {
  console.log("Server connected successfully");
  
})