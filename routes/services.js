var express = require('express');
var router = express.Router();

var User = require('../models/user');
const servicesController = require('../controllers/services');

// Creates new service for a user
router.post('/users/:userID/services/', servicesController.createService);

// Gets the services created by user
router.get('/users/:userID/services/',
    function (req, res, next) {
        User.findById(req.params.userID, (err, user) => {
            if (user == null || err) {
                res.status(404).send({'error': 'Unknown User ID'});
            } else {
                res.status(200).json(user.services);
            }
        });
    });

// Modifies user's service
router.put('/users/:userID/services/:serviceID', servicesController.updateService);

// Deletes user's service
router.delete('/users/:userID/services/:serviceID', servicesController.deleteService);

// Starts specific service
router.post('/users/:userID/services/:serviceID/start', servicesController.startService);

// Stops a specific service
router.post('/users/:userID/services/:serviceID/stop', servicesController.stopService);

module.exports = router