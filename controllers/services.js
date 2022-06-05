var User = require('../models/user');

const YAML = require('yaml')

const kubernetes = require('./kubernetes');

function toKubernetesConfig(config) {
    let rc_config = {
        apiVersion: 'v1',
        kind: 'ReplicationController',
        metadata: {
            name: config.name,
        },
        spec: {
            replicas: config.replicas,
            selector: {
                app: config.name,
            },
            template: {
                metadata: {
                    labels: {
                        app: config.name,
                    },
                },
                spec: {
                    containers: [
                        {
                            name: config.name,
                            image: config.image,
                            ports: [
                                {
                                    containerPort: config.port,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };

    return rc_config;
}

exports.createService =  function(req, res) {
    console.log(req.body);

    let rc_config = toKubernetesConfig(req.body);
    let owner_id = req.params.userID;

    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name === req.body.name);
            if (service) {
                res.status(400).send({'error': 'Service with the same name already exists'});
            } else {
                // set replicas to 0
                rc_config.spec.replicas = 0;

                kubernetes.createService(owner_id, rc_config).then((_) => {
                    user.services.push({
                        name: req.body.name,
                        active: false,
                        ingress: rc_config.metadata.name + '.kubehosting.duckdns.org',
                        replicas: req.body.replicas,
                        port: req.body.port,
                        image: req.body.image,
                    });
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

exports.startService = function(req, res, next) {
    let owner_id = req.params.userID;
    let service_id = req.params.serviceID;
    
    User.findById(owner_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name == service_id);
            let rc_config = toKubernetesConfig(service);
            
            if (service) {
                kubernetes.updateService(owner_id, rc_config).then((_) => {                           
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
            let rc_config = toKubernetesConfig(service);

            rc_config.spec.replicas = 0;
            
            if (service) {
                kubernetes.updateService(owner_id, rc_config).then((_) => {                           
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
    User.findById(owner_id, (err, user) => {
        if (err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            res.status(200).send(user.services);
        }
    });
}