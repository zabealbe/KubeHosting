const kubernetes = require("./kubernetes");
const prometheus = require("./prometheus");
const { mongoose } = require("mongoose");

exports.createService = function (req, res) {
    let user_id = req.owner._id.valueOf();

    let service = req.owner.services.find((service) => service.name === req.body.name);
    if (service) {
        res.status(400).send({ error: "Service with the same name already exists" });
    } else {
        const replicas = req.body.replicas;
        let service = {
            name: req.body.name,
            active: false,
            ingress: mongoose.Types.ObjectId().toString() + "." + process.env.DOMAIN,
            replicas: 0,
            port: req.body.port,
            image: req.body.image,
            command: req.body.command,
            args: req.body.args,
            env: req.body.env,
        };

        kubernetes
            .createService(user_id, service)
            .then((_) => {
                service.replicas = replicas;
                req.owner.services.push(service);

                req.owner
                    .save()
                    .then((_) => {
                        res.status(200).send(service);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({ error: "Error creating service" });
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error creating service" });
            });
    }
};

exports.updateService = function (req, res) {
    let user_id = req.owner._id.valueOf();

    let service = req.owner.services.find((service) => service.name === req.body.name);
    if (!service) {
        res.status(400).send({ error: "Service not found" });
    } else {
        service = Object.assign(service, req.body);

        kubernetes
            .updateService(user_id, service)
            .then((_) => {
                req.owner.save();

                res.status(200).send(service);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error updating service" });
            });
    }
};

exports.startService = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    service.active = true;

    if (service) {
        kubernetes
            .updateService(user_id, service)
            .then((_) => {
                service.active = true;
                req.owner.save();

                res.status(200).send(service);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Failed to start service" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.stopService = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    service.active = false;

    if (service) {
        kubernetes
            .updateService(user_id, service)
            .then((_) => {
                service.active = false;
                req.owner.save();

                res.status(200).send(service);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error stopping service" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.deleteService = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    if (service) {
        kubernetes
            .deleteService(user_id, service.name)
            .then((_) => {
                req.owner.services.splice(req.owner.services.indexOf(service), 1);
                req.owner.save();

                res.status(200).send({ message: "Service deleted" });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error deleting service" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.listServices = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let services = req.owner.services;

    kubernetes.getPods(user_id).then((pods) => {
        let pods_by_service = {};
        pods.forEach((pod) => {
            pods_by_service[pod.metadata.labels.app] = pod;
        });

        services.forEach((service) => {
            if(service.active) {
                service.status = pods_by_service[service.name] ? pods_by_service[service.name].status.phase : "Unknown";
            } else {
                service.status = "Stopped";
            }
        });

        console.log(JSON.stringify(services));
        res.status(200).send(services);
    });
};

exports.getServiceLogs = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    if (service) {
        console.log(user_id, service.name);
        kubernetes
            .getPodLogs(user_id, service.name)
            .then((logs) => {
                res.status(200).send(logs);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error getting service logs" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.getServiceStatus = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    if (service) {
        console.log(user_id, service.name);
        kubernetes
            .getPod(user_id, service.name)
            .then((pod) => {
                console.log(pod)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error getting service status" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.getServiceStats = function (req, res) {
    let user_id = req.owner._id.valueOf();
    let service_id = req.params.serviceID;

    let service = req.owner.services.find((service) => service.name == service_id);

    if (service) {
        let promise_cpu = prometheus.getServiceCpu(user_id, service.name, req.query.start, req.query.end, req.query.step);
        let promise_mem = prometheus.getServiceMem(user_id, service.name, req.query.start, req.query.end, req.query.step);
        let promise_net_snd = prometheus.getServiceNetSnd(user_id, service.name, req.query.start, req.query.end, req.query.step);
        let promise_net_rcv = prometheus.getServiceNetRcv(user_id, service.name, req.query.start, req.query.end, req.query.step);

        Promise.all([promise_cpu, promise_mem, promise_net_snd, promise_net_rcv])
            .then(([cpu_stats, mem_stats, net_stats_snd, net_stats_rcv]) => {
                res.status(200).send({
                    cpu: cpu_stats,
                    mem: mem_stats,
                    net_snd: net_stats_snd,
                    net_rcv: net_stats_rcv,
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ error: "Error getting service stats" });
            });
    } else {
        res.status(404).send({ error: "Service not found" });
    }
};

exports.getStats = function (req, res) {
    let user_id = req.owner._id.valueOf();

    let promise_cpu = prometheus.getNamespaceCpu(user_id, req.query.start, req.query.end, req.query.step);
    let promise_mem = prometheus.getNamespaceMem(user_id, req.query.start, req.query.end, req.query.step);
    let promise_net_snd = prometheus.getNamespaceNetSnd(user_id, req.query.start, req.query.end, req.query.step);
    let promise_net_rcv = prometheus.getNamespaceNetRcv(user_id, req.query.start, req.query.end, req.query.step);

    Promise.all([promise_cpu, promise_mem, promise_net_snd, promise_net_rcv])
        .then(([cpu_stats, mem_stats, net_stats_snd, net_stats_rcv]) => {
            res.status(200).send({
                cpu: cpu_stats,
                mem: mem_stats,
                net_snd: net_stats_snd,
                net_rcv: net_stats_rcv,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: "Error getting stats" });
        });
}