const zip = (xs, ys) => Array.from(Array(Math.min(xs.length, ys.length))).map((_, i) => [xs[i], ys[i]]);

function update_service_row(row, service, maxPODs) {
    // Active PODs
    row.children[2].children[0].innerText = service.activePODs;
    // Status & Status toggler
    if (service.active) {
        const online_status = document.getElementById('online-status').content.cloneNode(true).childNodes[1]; 
        const pause_toggler = document.getElementById('pause-toggler').content.cloneNode(true).childNodes[1];
        pause_toggler.childNodes[1].setAttribute('onclick', `stop_service('${service._id}')`);
        row.children[4].replaceWith(online_status);
        row.children[5].replaceWith(pause_toggler);
    } else {
        const offline_status = document.getElementById('offline-status').content.cloneNode(true).childNodes[1];
        const play_toggler = document.getElementById('play-toggler').content.cloneNode(true).childNodes[1];
        play_toggler.childNodes[1].setAttribute('onclick', `start_service('${service._id}')`);
        row.children[4].replaceWith(offline_status);
        row.children[5].replaceWith(play_toggler);
    }
    // Usage percentage
    row.children[6].innerText = `${Math.round(service.activePODs / maxPODs * 100)}%`;
}

async function update_service_table() {
    const userID = document.head.querySelector("meta[name='userID']").content;
    const maxPODs = document.head.querySelector("meta[name='maxPODs']").content;
    const table = document.getElementById('service-table');
    const rows = [...Array(table.rows.length).keys()].slice(1).map(i => table.rows[i]);
    
    const services = await fetch(`/users/${userID}/services`, { method: 'GET', credentials: 'include' })
        .then(res => res.json());

    zip(rows, services).forEach(([r, s]) => update_service_row(r, s, maxPODs));
}

function start_service(id) {
    const userID = document.head.querySelector("meta[name='userID']").content;
    fetch(`/users/${userID}/services/${id}/start`, { method: 'POST', credentials: 'include'}).then(_ => update_service_table()).catch(e => console.log(e));
}

function stop_service(id) {
    const userID = document.head.querySelector("meta[name='userID']").content;
    fetch(`/users/${userID}/services/${id}/stop`, { method: 'POST', credentials: 'include'}).then(_ => update_service_table()).catch(e => console.log(e));
}