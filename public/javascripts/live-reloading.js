const userID = document.head.querySelector("meta[name='userID']").content;
const maxPODs = document.head.querySelector("meta[name='maxPODs']").content;

function create_service_row(service, row_n) {
    const new_row = document.getElementById('service-row').content.cloneNode(true).childNodes[1];
    new_row.children[0].textContent = row_n;
    new_row.children[1].textContent = `${service.name}`;
    new_row.children[2].children[0].textContent = `${service.activePODs}`;
    new_row.children[2].children[1].children[0].setAttribute('placeholder', `${service.desiredPODs}`);
    if (service.active) {
        const online_status = document.getElementById('online-status').content.cloneNode(true).childNodes[1];
        const pause_toggler = document.getElementById('pause-toggler').content.cloneNode(true).childNodes[1];
        pause_toggler.childNodes[1].setAttribute('onclick', `stop_service('${service._id}')`);
        new_row.children[4].replaceWith(online_status);
        new_row.children[5].replaceWith(pause_toggler);
    } else {
        new_row.children[5].children[0].setAttribute('onclick', `start_service('${service._id}')`);
    }
    new_row.children[6].textContent = `${service.activePODs / maxPODs * 100}%`
    new_row.children[7].setAttribute('onclick', `delete_service('${service._id}')`);

    return new_row;
}

async function update_service_table() {
    const table = document.getElementById('service-table');

    const services = await fetch(`/users/${userID}/services`, { method: 'GET', credentials: 'include' })
        .then(res => {
            if (res.status == 304) {
                return [];
            } else {
                return res.json();
            }
        });

    if (services.length > 0) {
        const last_row = table.rows[table.rows.length - 1].cloneNode(true);
        const new_rows = services.map((s, i) => create_service_row(s, i));

        last_row.children[0].textContent = new_rows.length;
        new_rows.push(last_row);
        
        table.children[1].replaceChildren(...Array.from(new_rows));
    }
}

function start_service(id) {
    fetch(`/users/${userID}/services/${id}/start`, { method: 'POST', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function stop_service(id) {
    fetch(`/users/${userID}/services/${id}/stop`, { method: 'POST', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function delete_service(id) {
    fetch(`/users/${userID}/services/${id}`, { method: 'DELETE', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}