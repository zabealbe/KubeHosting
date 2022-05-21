var User            = require('../app/models/user');
var Service            = require('../app/models/service');

const { V1CustomResourceColumnDefinition } = require('@kubernetes/client-node');

module.exports = function (app) {

    // Creates a new service for a user
    app.post('/users/:userID/services/', function (req, res) {
        let new_service = new Service(
            {
                name: req.body.name,
                config: req.body.config,
                active: false,
            }
        );
        console.log(req.body)

        User.findById(req.params.userID, (err, user) => {
            console.log(user)
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                user.services.push(new_service);
                user.save();

                res.sendStatus(200);
            }
        });
    });

    // Gets the services created by a user
    app.get('/users/:userID/services/', function (req, res, next) {
        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                let services = user.services.map((s) => Service.findById(s, (_err, service) => service));
                console.log(services)

                res.status(200).json(services);
            }
        });
    });

    // Modifies the settings of a user's service
    app.put('/users/:userID/services/:serviceID', function (req, res, next) {
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

                        res.sendStatus(200);
                    }
                });
            }
        });
    });

    // Deletes a user's service
    app.delete('/users/:userID/services/:serviceID', function (req, res, next) {
        User.findById(req.params.userID, (err, user) => {
            if (err) {
                res.status(404).send('Unknown User ID');
            } else {
                Service.deleteOne({ _id: req.params.serviceID });

                user.services = user.services.filter(id => id != req.params.serviceID);

                res.sendStatus(200);
            }
        });
    });

    // Starts a specific service
    app.post('/users/:userID/services/:serviceID/start', function (req, res, next) {
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
                        res.sendStatus(200);
                    }
                });
            }
        });
    });

    // Stops a specific service
    app.post('/users/:userID/services/:serviceID/stop', function (req, res, next) {
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
                        res.sendStatus(200);
                    }
                });
            }
        });
    });
}