const k8s = require('@kubernetes/client-node');

if (process.env.NODE_ENV === 'test')  {
    k8sApi_network = {
        createNamespacedIngress: function(namespace, ingress) {
            return new Promise(function(resolve, reject) {
                resolve(ingress);
            });
        },
        
        replaceNamespacedIngress: function(name, namespace, ig_config) {
            return new Promise(function(resolve, reject) {
                resolve(ig_config);
            });
        },

        deleteNamespacedIngress: function(name, namespace) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }
    }

    k8sApi_core = {
        createNamespace: function(namespace) {
            return new Promise(function(resolve, reject) {
                resolve(namespace);
            });
        },

        createNamespacedReplicationController: function(name, namespace, rc_config) {
            return new Promise(function(resolve, reject) {
                resolve(rc_config);
            });
        },
        createNamespacedService: function(namespace, sv_config) {
            return new Promise(function(resolve, reject) {
                resolve(sv_config);
            });
        },

        replaceNamespacedReplicationController: function(name, namespace, rc_config) {
            return new Promise(function(resolve, reject) {
                resolve(rc_config);
            });
        },
        replaceNamespacedService: function(name, namespace, sv_config) {
            return new Promise(function(resolve, reject) {
                resolve(sv_config);
            });
        },


        deleteNamespacedReplicationController: function(name, namespace) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        },
        deleteNamespacedService: function(name, namespace) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        },
    }

} else {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('./config/kube/config.yml');
    k8sApi_network = kc.makeApiClient(k8s.NetworkingV1Api);
    k8sApi_core = kc.makeApiClient(k8s.CoreV1Api);
}


function createReplicationControllerConfig(config) {
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


function createServiceConfig(rc_config) {
    // get all the ports from the config
    let ports = [];
    for (let i = 0; i < rc_config.spec.template.spec.containers[0].ports.length; i++) {
        ports.push(rc_config.spec.template.spec.containers[0].ports[i].containerPort);
    }

    let sv_config = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: rc_config.metadata.name,
        },
        spec: {
            ports: [
                {
                    port: ports[0],
                    targetPort: ports[0],
                },
            ],
            selector: {
                app: rc_config.metadata.name,
            },
        },
    };

    return sv_config
}

function createIngressConfig(sv_config) {
    let ports = [];
    for (let i = 0; i < sv_config.spec.ports.length; i++) {
        ports.push(sv_config.spec.ports[i].targetPort);
    }
  
    let ig_config = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: sv_config.metadata.name,
        },
        spec: {
            rules: [
                {
                    host: sv_config.metadata.name + '.kubehosting.duckdns.org',
                    http: {
                        paths: [
                            {
                                pathType: 'Prefix',
                                path: '/',
                                backend: {
                                    service: {
                                        name: sv_config.metadata.name,
                                        port: {
                                            number: ports[0],
                                        }
                                    }
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };

    return ig_config
}

exports.createNamespace =  function(name) {
    var namespace = {
        metadata: {
            name: name,
        },
    };

    return k8sApi_core.createNamespace(namespace)
}

exports.createService = function(namespace, service) {
    let rc_config = createReplicationControllerConfig(service);
    let sv_config = createServiceConfig(rc_config);
    let ig_config = createIngressConfig(sv_config);

    let rc_promise = k8sApi_core.createNamespacedReplicationController(namespace, rc_config);
    let sv_promise = k8sApi_core.createNamespacedService(namespace, sv_config);
    let ig_promise = k8sApi_network.createNamespacedIngress(namespace, ig_config);

    let all_proimse =  Promise.all([rc_promise, sv_promise, ig_promise]);

    // Undo the creation if any of the promises fail
    return all_proimse.catch(function(err) {
        console.log(err);
        
        console.log("Rolling back resources creation");
        exports.deleteService(namespace, rc_config.metadata.name);
    });
}

exports.updateService = function(namespace, service) {
    let service_id = service.name;
    
    let rc_config = createReplicationControllerConfig(service);
    let sv_config = createServiceConfig(rc_config);
    let ig_config = createIngressConfig(sv_config);

    let rc_promise = k8sApi_core.replaceNamespacedReplicationController(service_id, namespace, rc_config);
    let sv_promise = k8sApi_core.replaceNamespacedService(service_id, namespace, sv_config);
    let ig_promise = k8sApi_network.replaceNamespacedIngress(service_id, namespace, ig_config);

    return Promise.all([rc_promise, sv_promise, ig_promise])
}

exports.deleteService = function(namespace, service_id) {
    let rc_promise = k8sApi_core.deleteNamespacedReplicationController(service_id, namespace, undefined, undefined, undefined, undefined,'Foreground').catch(function(err) {
        if (err.response.statusCode == 404) {
            console.log('ReplicationController ' + service_id + ' in namespace ' + namespace + ' not present');
        } else {
            throw err;
        }
    });

    let sv_promise = k8sApi_core.deleteNamespacedService(service_id, namespace).catch(function(err) {
        if (err.response.statusCode == 404) {
            console.log('Service ' + service_id + ' in namespace ' + namespace + ' not present');
        } else {
            throw err;
        }
    });

    let ig_promise = k8sApi_network.deleteNamespacedIngress(service_id, namespace).catch(function(err) {
        if (err.response.statusCode == 404) {
            console.log('Ingress ' + service_id + ' in namespace ' + namespace + ' not present');
        } else {
            throw err;
        }
    });

    let all_promise = Promise.all([rc_promise, sv_promise, ig_promise]);

    return all_promise;
}