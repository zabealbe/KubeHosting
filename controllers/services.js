var User = require('../models/user');

const YAML = require('yaml')

const kubernetes = require('./kubernetes');

exports.createService =  function(req, res) {
    let owner_id = req.params.userID;

    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name === req.body.name);
            if (service) {
                res.status(400).send({'error': 'Service with the same name already exists'});
            } else {
                let service = {
                    name: req.body.name,
                    active: false,
                    ingress: `${req.body.name}.${req.user.username}.` + process.env.DOMAIN,
                    replicas: req.body.replicas,
                    port: req.body.port,
                    image: req.body.image,
                }

                req.body.replicas = 0; // disable service while creating it

                kubernetes.createService(owner_id, service).then((_) => {
                    user.services.push(service);
                    user.save();

                    res.status(200).send(user.services[user.services.length - 1]);
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({'error': 'Error creating service'});
                });
            }
        }
    });
}

exports.updateService =  function(req, res) {
    let owner_id = req.params.userID;

    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name === req.body.name);
            if (!service) {
                res.status(400).send({'error': 'Service not found'});
            } else {
                service = Object.assign(service, req.body);

                kubernetes.updateService(owner_id, service).then((_) => {
                    user.save();

                    res.status(200).send(service);
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({'error': 'Error updating service'});
                });
            }
        }
    });
}

exports.startService = function(req, res, next) {
    let owner_id = req.params.userID;
    let service_id = req.params.serviceID;
    
    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name == service_id);

            service.active = true;
            
            if (service) {
                kubernetes.updateService(owner_id, service).then((_) => {                           
                    service.active = true;
                    user.save();
                
                    res.status(200).send(service);
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({'error': 'Failed to start service'});
                });
            } else {
                res.status(404).send({'error': 'Service not found'});
            }
        }
    });
}

exports.stopService = function(req, res, next) {
    let owner_id = req.params.userID;
    let service_id = req.params.serviceID;
    
    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name == service_id);

            service.active = false;
            
            if (service) {
                kubernetes.updateService(owner_id, service).then((_) => {                           
                    service.active = false;
                    user.save();
                
                    res.status(200).send(service);
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({'error': 'Error stopping service'});
                });
            } else {
                res.status(404).send({'error': 'Service not found'});
            }
        }
    });
}

exports.deleteService = function(req, res, next) {
    let owner_id = req.params.userID;
    let service_id = req.params.serviceID;

    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name == service_id);

            if (service) {
                kubernetes.deleteService(owner_id, service.name).then((_) => {
                    user.services.splice(user.services.indexOf(service), 1);
                    user.save();

                    res.status(200).send({'message': 'Service deleted'});
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send({'error': 'Error deleting service'});
                });
            } else {
                res.status(404).send({'error': 'Service not found'});
            }
        }
    });
}

exports.listServices = function(req, res, next) {
    let owner_id = req.params.userID;

    User.findById(owner_id, (err, user) => {
        if (err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            res.status(200).send(user.services);
        }
    });
}