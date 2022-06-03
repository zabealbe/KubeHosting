var User = require('../models/user');

const YAML = require('yaml')

const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromFile('./config/kube/config.yml');
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

exports.createNamespace =  function(name, callback) {
    var namespace = {
        metadata: {
            name: name,
        },
    };

    k8sApi.createNamespace(namespace).then((res) => {
        console.log(res);
    });
}

exports.createService =  function(res, req, next) {
    let rc_config = req.body.config; // replication controller config
    console.log(rc_config)

    listServices(owner_id, (services) => {
            let service = services.find(service => service.name === name);
            if (service) {
                res.code(400).send({'error': 'Service with the same name already exists'});
            } else {
                User.findById(owner_id, (err, user) => {
                    if (err) {
                        res.code(404).send({'error': 'User not found'});
                    } else {
                        k8sApi.createNamespacedReplicationController(owner_id, rc).then((res) => {                           
                            user.services.push({
                                name: rc_config.metadata.config,
                                config: rc_config,
                                active: true,
                            });
                            user.save();

                            res.code(200).send(user.services[user.services.length - 1]);
                        });
                    }
                });
            }
        }
    );
}

exports.launchService = function(owner_id, callback) {
    
}

exports.listServices = function(res, req, next) {
    User.findById(owner_id, (err, user) => {
        if (err) {
            res.code(404).send({'error': 'User not found'});
        } else {
            res.code(200).send(user.services);
        }
    });
    /*
    k8sApi.listNamespacedPod(owner_id).then((res) => {
        callback(res.body.items);
    });*/
}