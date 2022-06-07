var express = require('express');
var router = express.Router();

const imagesController = require('../controllers/images');

// Check if image is valid
router.get('/images/:image(*)', imagesController.getImage);

module.exports = router