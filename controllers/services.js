var User = require('../models/user');

const YAML = require('yaml')

const kubernetes = require('./kubernetes');
const { mongoose } = require('mongoose');

exports.createService =  function(req, res) {
    let user_id = req.owner._id.valueOf();

    let service = req.owner.services.find(service => service.name === req.body.name);
    if (service) {
        res.status(400).send({'error': 'Service with the same name already exists'});
    } else {
        const replicas = req.body.replicas;
        let service = {
            name: req.body.name,
            active: false,
            ingress: mongoose.Types.ObjectId().toString() + '.' + process.env.DOMAIN,
            replicas: 0,
            port: req.body.port,
            image: req.body.image,
            command: req.body.command,
            args: req.body.args,
            env: req.body.env,
        }

        kubernetes.createService(user_id, service).then((_) => {
            service.replicas = replicas;
            user.services.push(service);

            user.save().then((_) => {
                res.status(200).send(service);
            }).catch((err) => {
                console.log(err);
                res.status(500).send({'error': 'Error creating service'});
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).send({'error': 'Error creating service'});
        });
    }
}

exports.updateService =  function(req, res) {
    let user_id = req.owner._id.valueOf();
    
    let service = req.owner.services.find(service => service.name === req.body.name);
    if (!service) {
        res.status(400).send({'error': 'Service not found'});
    } else {
        service = Object.assign(service, req.body);

        kubernetes.updateService(user_id, service).then((_) => {
            user.save();

            res.status(200).send(service);
        }).catch((err) => {
            console.log(err);
            res.status(500).send({'error': 'Error updating service'});
        });
    }
}

exports.startService = function(req, res, next) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = user.services.find(service => service.name == service_id);

    service.active = true;
    
    if (service) {
        kubernetes.updateService(user_id, service).then((_) => {                           
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

exports.stopService = function(req, res, next) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;
    
    let service = req.owner.services.find(service => service.name == service_id);

    service.active = false;
    
    if (service) {
        kubernetes.updateService(user_id, service).then((_) => {                           
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

exports.deleteService = function(req, res, next) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find(service => service.name == service_id);

    if (service) {
        kubernetes.deleteService(user_id, service.name).then((_) => {
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

exports.listServices = function(req, res, next) {
    res.status(200).send(req.owner.services);
}

exports.getServiceLogs = function(req, res, next) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find(service => service.name == service_id);

    if (service) {
        console.log(user_id, service.name)
        kubernetes.getServiceLogs(user_id, service.name).then((logs) => {
            res.status(200).send(logs);
        }).catch((err) => {
            console.log(err);
            res.status(500).send({'error': 'Error getting service logs'});
        });
    } else {
        res.status(404).send({'error': 'Service not found'});
    }
}

exports.getServiceStats = function(req, res, next) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find(service => service.name == service_id);

    if (service) {
        console.log(user_id, service.name)
        kubernetes.getServiceLogs(user_id, service.name).then((logs) => {
            res.status(200).send(logs);
        }).catch((err) => {
            console.log(err);
            res.status(500).send({'error': 'Error getting service logs'});
        });
    } else {
        res.status(404).send({'error': 'Service not found'});
    }
}