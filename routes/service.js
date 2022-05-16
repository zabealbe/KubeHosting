var express = require('express');
var router = express.Router();

// Creates a new service for a user
router.post('/users/:userID/services/', function(req, res, next) {
    // TODO
});

// Gets the services created by a user
router.get('/users/:userID/services/', function(req, res, next) {
    // TODO
});

// Modifies the settings of a user's service
router.put('/users/:userID/services/:serviceID', function(req, res, next) {
    // TODO
});

// Deletes a user's service
router.delete('/users/:userID/services/:serviceID', function(req, res, next) {
    // TODO
});

// Starts a specific service
router.post('/users/:userID/services/:serviceID/start', function(req, res, next) {
    // TODO
});

// Stops a specific service
router.post('/users/:userID/services/:serviceID/stop', function(req, res, next) {
    // TODO
});

module.exports = router;