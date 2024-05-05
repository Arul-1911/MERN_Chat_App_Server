const express = require('express');
const { registerUser, authUser, allUsers } = require('../Controllers/userController');
const {protect} = require('../Middlewares/authMiddleware');


const router = express.Router();


router.route('/').post(registerUser).get(protect,allUsers)
router.post('/login', authUser)

module.exports = router