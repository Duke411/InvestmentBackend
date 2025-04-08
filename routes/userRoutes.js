const express = require('express');
const router = express.Router();
const {signup} = require('../controls/AuthController')

router.post('/signup', signup)

module.exports = router