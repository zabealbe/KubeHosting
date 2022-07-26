const { PrometheusDriver } = require('prometheus-query');

var prom;
if (process.env.NODE_ENV === 'test')  {
    prom = new Proxy({}, {
        get: function(target, name) {
            return () => {
                return new Promise(function(resolve, reject) {
                    resolve(undefined);
                });
            }
        }
    });
} else {
    prom = new PrometheusDriver({
        endpoint: process.env.PROMETHEUS_URL,
        baseURL: "/api/v1", // default value,
        responseInterceptor: {
            onFulfilled: (x) => console.log(x),
            onRejected: (x) => console.log(x)
        }
    });
}



exports.getServiceStats = function(namespace, service_id) {
    console.log(process.env.PROMETHEUS_URL);
    const q = `max(rate(container_cpu_usage_seconds_total{container='${service_id}', namespace='${namespace}'}[1m]))`;
    return prom.instantQuery(q)
        .then((res) => {
            const series = res.result;
            series.forEach((serie) => {
                console.log("Serie:", serie.metric.toString());
                console.log("Time:", serie.value.time);
                console.log("Value:", serie.value.value);
            });
        })
        .catch(console.error);
}