const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromFile('./config/kube/config.yml');
const k8sApi_network = kc.makeApiClient(k8s.NetworkingV1Api);
const k8sApi_core = kc.makeApiClient(k8s.CoreV1Api);

exports.createNamespace =  function(name) {
    var namespace = {
        metadata: {
            name: name,
        },
    };

    return k8sApi_core.createNamespace(namespace)
}

exports.createService = function(namespace, rc_config) {
    // get all the ports from the config
    let ports = [];
    for (let i = 0; i < rc_config.spec.template.spec.containers[0].ports.length; i++) {
        ports.push(rc_config.spec.template.spec.containers[0].ports[i].containerPort);
    }

    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    // create the service
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

    let ig_config = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: rc_config.metadata.name,
        },
        spec: {
            rules: [
                {
                    host: rc_config.metadata.name + '.kubehosting.duckdns.org',
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

    rc_promise = k8sApi_core.createNamespacedReplicationController(namespace, rc_config);
    sv_promise = k8sApi_core.createNamespacedService(namespace, sv_config);
    ig_promise = k8sApi_network.createNamespacedIngress(namespace, ig_config);

    return Promise.all([rc_promise, sv_promise, ig_config])
}

exports.updateService = function(namespace, rc_config) {
    let service_id = rc_config.metadata.name;

    return k8sApi_core.replaceNamespacedReplicationController(service_id, namespace, rc_config);
}

exports.deleteService = function(namespace, service_id) {
    rc_promise = k8sApi_core.deleteNamespacedReplicationController(service_id, namespace, undefined, undefined, undefined, undefined,'Foreground');
    sv_promise = k8sApi_core.deleteNamespacedService(service_id, namespace);
    ig_promise = k8sApi_network.deleteNamespacedIngress(service_id, namespace);

    return Promise.all([rc_promise, sv_promise, ig_promise])
}