const express = require('express')

const router = express.Router();
const {signup, login, refresh, logout, current}  =require('../../controlers/controlers.js')


router.post('/signup', signup);

router.post('/login', login)

router.post('/refresh-token', refresh)

router.post('/logout', logout)

router.post('/current', current)

module.exports = router