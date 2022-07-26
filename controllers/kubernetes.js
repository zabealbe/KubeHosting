const k8s = require('@kubernetes/client-node');
const request = require('request');

const kc = new k8s.KubeConfig();
if (process.env.NODE_ENV === 'test')  {
    k8sApi_network = new Proxy({}, {
        get: function(target, name) {
            return () => {
                return new Promise(function(resolve, reject) {
                    resolve(undefined);
                });
            }
        }
    });


    k8sApi_core = new Proxy({}, {
        get: function(target, name) {
                return () => {
                    return new Promise(function(resolve, reject) {
                        resolve(undefined);
                    });
                }
            }
        });

} else {
    kc.loadFromFile('./config/kube/config.yml');
    k8sApi_network = kc.makeApiClient(k8s.NetworkingV1Api);
    k8sApi_core = kc.makeApiClient(k8s.CoreV1Api);
}


function createReplicationControllerConfig(params) {
    let rc_config = {
        apiVersion: 'v1',
        kind: 'ReplicationController',
        metadata: {
            name: params.name,
        },
        spec: {
            replicas: params.replicas,
            selector: {
                app: params.name,
            },
            template: {
                metadata: {
                    labels: {
                        app: params.name,
                    },
                },
                spec: {
                    containers: [
                        {
                            name: params.name,
                            image: params.image,
                            ports: [
                                {
                                    containerPort: params.port,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };

    if (params.command) {
        rc_config.spec.template.spec.containers[0].command = [params.command];
    }
    if (params.args) { 
        rc_config.spec.template.spec.containers[0].args = params.args;
    }

    return rc_config;
}


function createServiceConfig(params) {
    // get all the ports from the params
    let ports = [params.port]

    let sv_config = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: params.name,
        },
        spec: {
            ports: [
                {
                    port: ports[0],
                    targetPort: ports[0],
                },
            ],
            selector: {
                app: params.name,
            },
        },
    };

    return sv_config
}

function createIngressConfig(params) {
    let ports = [params.port]
  
    let ig_config = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: params.name,
        },
        spec: {
            rules: [
                {
                    host: params.ingress,
                    http: {
                        paths: [
                            {
                                pathType: 'Prefix',
                                path: '/',
                                backend: {
                                    service: {
                                        name: params.name,
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

function createLimitRangeConfig(params) {
    let lr_config = {
        apiVersion: 'v1',
        kind: 'LimitRange',
        metadata: {
            name: params.name,
        },
        spec: {
            limits: [
                {
                    type: 'Container',
                    default: {
                        cpu: params.cpu,
                        memory: params.memory,
                    },
                    defaultRequest: {
                        cpu: "200m",
                        memory: "128Mi",
                    },
                },
            ],
        },
    };

    return lr_config;
}

function createResourceQuotaConfig(params) {
    let rq_config = {
        apiVersion: 'v1',
        kind: 'ResourceQuota',
        metadata: {
            name: params.name,
        },
        spec: {
            hard: {
                cpu: params.cpu,
                memory: params.memory,
            },
        },
    };

    return rq_config;
}

function createNamespaceConfig(name) {
    let n_config = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: name,
        },
    };

    return n_config;
}

exports.createNamespace =  function(name, limit_cpu, limit_ram) {
    const rq_params = {
        name: name,
        cpu: limit_cpu,
        memory: limit_ram,
    }

    let n_config = createNamespaceConfig(name);
    let lr_config = createLimitRangeConfig(rq_params);
    let rq_config = createResourceQuotaConfig(rq_params);

    return k8sApi_core.createNamespace(n_config)
        .then(function() {
            let lr_promise = k8sApi_core.createNamespacedLimitRange(name, lr_config);
            let rq_promise = k8sApi_core.createNamespacedResourceQuota(name, rq_config)
            
            let all_promise = Promise.all([lr_promise, rq_promise]);
            return all_promise.catch(function(err) {
                console.log(err);

                console.log("Rolling back namespace creation");
                exports.deleteNamespace(name);

                return Promise.reject(err);
            });
        }).catch(function(err) {
            console.log(err);
            
            console.log("Rolling back namespace creation");
            exports.deleteNamespace(name);

            return Promise.reject(err);
        });
}

exports.updateResourceQuota = function(namespace, params) {
    const rq_name = namespace;

    let rq_config = createResourceQuotaConfig(params);
    rq_config.metadata.name = rq_name;

    return k8sApi_core.replaceNamespacedResourceQuota(rq_name, namespace, rq_config);
}

exports.deleteNamespace = function(name) {
    return k8sApi_core.deleteNamespace(name);
}

exports.createService = function(namespace, service) {
    let rc_config = createReplicationControllerConfig(service);
    let sv_config = createServiceConfig(service);
    let ig_config = createIngressConfig(service);

    console.log(JSON.stringify(rc_config, null, 2));

    let rc_promise = k8sApi_core.createNamespacedReplicationController(namespace, rc_config);
    let sv_promise = k8sApi_core.createNamespacedService(namespace, sv_config);
    let ig_promise = k8sApi_network.createNamespacedIngress(namespace, ig_config);

    let all_promise =  Promise.all([rc_promise, sv_promise, ig_promise]);

    // Undo the creation if any of the promises fail
    return all_promise.catch(function(err) {
        console.log(err);
        
        console.log("Rolling back resources creation");
        exports.deleteService(namespace, rc_config.metadata.name)

        return Promise.reject(err);
    });
}

exports.updateService = function(namespace, service) {
    let service_id = service.name;
    
    let rc_config = createReplicationControllerConfig(service);
    let sv_config = createServiceConfig(service);
    let ig_config = createIngressConfig(service);

    if (!service.active) {
        rc_config.spec.replicas = 0;
    }

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

exports.getServiceLogs = function(namespace, service_id) {
    return k8sApi_core.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, `app=${service_id}`)
        .then(function(res) {
            let pod_name = res.body.items[0].metadata.name; // pod name

            return k8sApi_core.readNamespacedPodLog(pod_name, namespace)})
        .then(function(res) {
            return res.body || "";
        });
}
