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
        baseURL: '/api/v1', // default value,
        headers: {
            'Accept-Encoding': 'gzip'
        },
        responseInterceptor: {
            onFulfilled: (cfg) => ({
                ...cfg,
                responseType: 'json',
                decompress: false
              }),
            onRejected: (x) => console.log(`${x}`)
        }
    });
}



exports.getServiceCpu = function(namespace, service_id, start, end, step) {
    let q = ''
    q += `sum(rate(container_cpu_usage_seconds_total{container!='POD',pod=~'diocancaro.*',namespace!='kube-system',namespace!='default',namespace!='ingress-nginx'}[1m]))`
    q += `/ on() kube_pod_container_resource_limits{resource='cpu', pod=~'diocancaro.*'}`
    
    return prom.rangeQuery(q, start, end, step)
        .then((res) => {
            return Array.from(res.result.values())
        })
        .catch(console.error);
}