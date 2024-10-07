const express = require('express')
const createCategory = require('../controller/categoryController')

const router = express.Router()

router.post('/create-category', createCategory)




module.exports = router