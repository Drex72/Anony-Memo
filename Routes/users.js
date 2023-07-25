const express = require("express")
const isLoggedIn = require("../Auth/isLoggedIn")
const { CreateUser, LoginUser, Logout, GetUser } = require("../Controllers/userController")


const router = express.Router()


router.post('/users/create', CreateUser)
router.post('/users/login', LoginUser)
router.post('/users/create', Logout)
router.get('/users/get-user', isLoggedIn, GetUser)