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

function query(q, start, end, step) {
    return prom.rangeQuery(q, start, end, step)
        .then((res) => {
            res = res.result[0];
            return res ? res.values : [];
        }).catch(console.error);
}


// per namespace ===============================================================
exports.getNamespaceCpu = function(namespace, start, end, step) {
    /* get cpu usage for specified namespace */
    let q = ''
    q += `sum(irate(container_cpu_usage_seconds_total{container='', namespace='${namespace}'}[2m]))`

    return query(q, start, end, step)
}

exports.getNamespaceMem = function(namespace, start, end, step) {
    /* get cpu usage for specified namespace */
    let q = ''
    q += `sum(container_memory_usage_bytes{container='', namespace='${namespace}'}) / 1000000`

    return query(q, start, end, step)
}

exports.getNamespaceNetSnd = function(namespace, start, end, step) {
    /* get cpu usage for specified namespace */
    let q = ''
    q += `sum(irate(container_network_transmit_bytes_total{namespace='${namespace}', id=~"/kubepods/.*"}[2m]))`

    return query(q, start, end, step)
}

exports.getNamespaceNetRcv = function(namespace, start, end, step) {
    /* get cpu usage for specified namespace */
    let q = ''
    q += `sum(irate(container_network_receive_bytes_total{namespace='${namespace}', id=~"/kubepods/.*"}[2m]))`

    return query(q, start, end, step)
}

// per service =================================================================
exports.getServiceCpu = function(namespace, service_id, start, end, step) {
    let q = ''
    q += `irate(container_cpu_usage_seconds_total{container='',pod=~'${service_id}.*', namespace='${namespace}'}[2m])`

    //q += `/ on() kube_pod_container_resource_limits{resource='cpu', pod=~'${service_id}.*', namespace='${namespace}'}`

    return query(q, start, end, step)
}

exports.getServiceMem = function(namespace, service_id, start, end, step) {
    let q = ''
    q += `container_memory_usage_bytes{container='', pod=~'${service_id}.*', namespace='${namespace}'} / 1000000`
    //q += `/ on() kube_pod_container_resource_limits{resource='memory', pod=~'${service_id}.*', namespace='${namespace}'}`
    
    return query(q, start, end, step)
}

exports.getServiceNetSnd = function(namespace, service_id, start, end, step) {
    let q = ''
    q += `irate(container_network_transmit_bytes_total{pod=~'${service_id}.*', namespace='${namespace}', id=~"/kubepods/.*"}[2m])`
    
    return query(q, start, end, step)
}

exports.getServiceNetRcv = function(namespace, service_id, start, end, step) {
    let q = ''
    q += `irate(container_network_receive_bytes_total{pod=~'${service_id}.*', namespace='${namespace}', id=~"/kubepods/.*"}[2m])`
    
    return query(q, start, end, step)
}