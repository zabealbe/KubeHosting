var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const DB_URI = 'mongodb://localhost:27017/kubehosting';

const User = require('../app/models/user');
const Service = require('../app/models/service');

// Creates a new service for a user
router.post('/users/:userID/services/', function (req, res, next) {
    mongoose.connect(DB_URI);

    const new_service = new Service(
        {
            name: req.body.name,
            config: req.body.config,
            active: false,
        }
    );
    await new_service.save();

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            user.services.push(new_service._id);
            user.save();

            res.status(100);
        }
    });
});

// Gets the services created by a user
router.get('/users/:userID/services/', function (req, res, next) {
    mongoose.connect(DB_URI);

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            let services = user.services.map((s) => Service.findByID(s, (_err, service) => service));

            res.status(100).send(services);
        }
    });
});

// Modifies the settings of a user's service
router.put('/users/:userID/services/:serviceID', function (req, res, next) {
    mongoose.connect(DB_URI);

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            Service.findByID(req.params.serviceID, (err, s) => {
                if (err) {
                    res.status(404).send('Unknown Service ID');
                } else {
                    s.config = req.body.config;
                    await s.save();
                }
            })
        }
    });
});

// Deletes a user's service
router.delete('/users/:userID/services/:serviceID', function (req, res, next) {
    mongoose.connect(DB_URI);

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            await Service.deleteOne({ _id: req.params.serviceID });
            
            user.services = user.services.filter(id => id != req.params.serviceID);

            res.sendStatus(100);
        }
    });
});

// Starts a specific service
router.post('/users/:userID/services/:serviceID/start', function (req, res, next) {
    mongoose.connect(DB_URI);

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            Service.findByID(req.params.serviceID, (err, service) => {
                if (err) {
                    res.status(404).send('Unknown Service ID');
                } else {
                    service.active = true;
                    await service.save();

                    // TODO: Add Kubernetes Code for actually running something
                }
            });
        }
    });
});

// Stops a specific service
router.post('/users/:userID/services/:serviceID/stop', function (req, res, next) {
    mongoose.connect(DB_URI);

    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            res.status(404).send('Unknown User ID');
        } else {
            Service.findByID(req.params.serviceID, (err, service) => {
                if (err) {
                    res.status(404).send('Unknown Service ID');
                } else {
                    service.active = false;
                    await service.save();

                    // TODO: Add Kubernetes Code for actually running something
                }
            });
        }
    });
});

module.exports = router;