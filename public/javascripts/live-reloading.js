const zip = (xs, ys) => Array.from(Array(Math.min(xs.length, ys.length))).map((_, i) => [xs[i], ys[i]]);

function update_service_row(row, service, maxPODs) {
    // Active PODs
    row.children[2].children[0].innerText = service.activePODs;
    // Status & Status toggler
    if(service.active) {
        row.children[4] = document.createElement('online-status');
        row.children[5] = document.createElement('pause-toggler');
    } else {
        row.children[4] = document.createElement('offline-status');
        row.children[5] = document.createElement('play-toggler');
    }
    // Usage percentage
    row.children[6] = `${Math.round(service.activePODs / maxPODs * 100)}%`;
}

function update_service_table() {
    const userID = document.head.querySelector("meta[name='userID']").content;
    const maxPODs = document.head.querySelector("meta[name='maxPODs']").content;
    const table = document.getElementById('service-table');
    const rows = [...Array(table.rows.length).keys()].slice(1).map(i => table[i]);
    const services = JSON.parse(fetch(`/users/${userID}/services`, {method: 'GET', credentials: 'include'}));

    zip(rows, services).forEach(([r, s]) => update_service_row(r, s, maxPODs));
}
