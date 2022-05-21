const mongoose = require('mongoose');
const DB_URI = require('../config/database').url;

const User = require('../app/models/user');
const Service = require('../app/models/service');

module.exports = function (app) {

    // Creates a new service for a user
    app.post('/users/:userID/services/', function (req, res, next) {
        mongoose.connect(DB_URI);

        let new_service = new Service(
            {
                name: req.body.name,
                config: req.body.config,
                active: false,
            }
        );
        new_service.save();

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                user.services.push(new_service._id);
                user.save();

                res.sendStatus(100);
            }
        });
    });

    // Gets the services created by a user
    app.get('/users/:userID/services/', function (req, res, next) {
        mongoose.connect(DB_URI);

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                let services = user.services.map((s) => Service.findById(s, (_err, service) => service));

                res.status(100).send(services);
            }
        });
    });

    // Modifies the settings of a user's service
    app.put('/users/:userID/services/:serviceID', function (req, res, next) {
        mongoose.connect(DB_URI);

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                Service.findById(req.params.serviceID, (err, s) => {
                    if (err) {
                        res.status(404).send('Unknown Service ID');
                    } else {
                        s.config = req.body.config;
                        s.save();
                    }
                })
            }
        });
    });

    // Deletes a user's service
    app.delete('/users/:userID/services/:serviceID', function (req, res, next) {
        mongoose.connect(DB_URI);

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                Service.deleteOne({ _id: req.params.serviceID });

                user.services = user.services.filter(id => id != req.params.serviceID);

                res.sendStatus(100);
            }
        });
    });

    // Starts a specific service
    app.post('/users/:userID/services/:serviceID/start', function (req, res, next) {
        mongoose.connect(DB_URI);

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                Service.findById(req.params.serviceID, (err, service) => {
                    if (err) {
                        res.status(404).send('Unknown Service ID');
                    } else {
                        service.active = true;
                        service.save();

                        // TODO: Add Kubernetes Code for actually running something
                    }
                });
            }
        });
    });

    // Stops a specific service
    app.post('/users/:userID/services/:serviceID/stop', function (req, res, next) {
        mongoose.connect(DB_URI);

        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                Service.findById(req.params.serviceID, (err, service) => {
                    if (err) {
                        res.status(404).send('Unknown Service ID');
                    } else {
                        service.active = false;
                        service.save();

                        // TODO: Add Kubernetes Code for actually running something
                    }
                });
            }
        });
    });
}