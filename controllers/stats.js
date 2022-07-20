var User = require('../models/user');
const { PrometheusDriver } = require('prometheus-query');

const prom = new PrometheusDriver({
    endpoint: "https://prometheus.kubehosting.duckdns.org",
    baseURL: "/api/v1" // default value
});

exports.getServiceStats = function(req, res) {
    let user_id = req.params.userID;
    let service_id = req.params.serviceID;

    let start = req.query.start || new Date().getTime() - (60 * 60 * 1000);
    let end = req.query.end || new Date().getTime();

    User.findById(user_id, (err, user) => {
        if (!user || err) {
            res.status(404).send({'error': 'User not found'});
        } else {
            let service = user.services.find(service => service.name == service_id);

            if (service) {
                const start = new Date().getTime() - 24 * 60 * 60 * 1000;
                const end = new Date();
                const step = 6 * 60 * 60; // 1 point every 6 hours

                user_id = "62adebd7f5c79ca4b347487d"
                service.name = "sour"

                const query = "kube_replicationcontroller_status_replicas{namespace=\"" + user_id + "\", replicationcontroller=\"" + service.name + "\"}"
                console.log(query)
                prom.instantQuery(query)
                    .then(result => {
                        console.log(result)
                        res.status(200).send(result);
                    }).catch(err => {
                        console.log(err)
                        res.status(500).send({'error': 'Error getting service stats'});
                    });
                    /*
                prom.rangeQuery(query, start, end, step)
                    .then((result) => {
                        res.status(200).send(result);
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).send({'error': 'Failed to get stats'});
                    });*/
            } else {
                res.status(404).send({'error': 'Service not found'});
            }
        }
    });
}
