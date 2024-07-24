    const express = require('express')
    const authMiddleware = require ('../../middleware/jwt.js')
    const router = express.Router();
    const { signup, login, refresh, logout, current, uploadAvatar } = require('../../controlers/controlers.js')
    const { upload } = require('../../controlers/avatars')

    const uploadMiddleware = upload()

    router.post('/signup', signup);

    router.post('/login', login)

    router.post('/refresh-token',authMiddleware, refresh)

    router.post('/logout', logout)

    router.post('/current', current)

    router.post('/upload', authMiddleware, uploadMiddleware.single('picture'),uploadAvatar )

    module.exports = router
