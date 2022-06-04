var express = require('express');
var router = express.Router();

var User = require('../models/user');
const servicesController = require('../controllers/services');

// Creates a new service for a user
router.post('/users/:userID/services/', servicesController.createService);

// Gets the services created by a user
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

// Modifies the settings of a user's service
router.put('/users/:userID/services/:serviceID',
    function (req, res, next) {
        User.findById(req.params.userID, (err, user) => {
            if (user == null || err) {
                res.status(404).send('Unknown User ID');
            } else {
                let s = user.services.find(({ _id }) => _id == req.params.serviceID);
                if (s) {
                    s.config = req.body.config;
                    user.save();

                    res.sendStatus(200);
                } else {
                    res.status(404).send('Unknown Service ID');
                }
            }
        });
    });

// Deletes a user's service
router.delete('/users/:userID/services/:serviceID', servicesController.deleteService);

// Starts a specific service
router.post('/users/:userID/services/:serviceID/start', servicesController.startService);
    /*
    function (req, res, next) {
    User.findById(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            let service = user.services.find(({ _id }) => _id == req.params.serviceID);
            if (service) {
                service.active = true;
                user.save();

                // TODO: Add Kubernetes Code for actually running something
                res.sendStatus(200);
            } else {
                res.status(404).send('Unknown Service ID');
            }
        }
    });
});*/

// Stops a specific service
router.post('/users/:userID/services/:serviceID/stop', servicesController.stopService);
/*, function (req, res, next) {
    User.findById(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            let service = user.services.find(({ _id }) => _id == req.params.serviceID);
            if (service) {
                service.active = false;
                user.save();

                // TODO: Add Kubernetes Code for actually running something
                res.sendStatus(200);
            } else {
                res.status(404).send('Unknown Service ID');
            }
        }
    });
});*/

module.exports = router