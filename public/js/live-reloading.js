const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;
const userID = document.head.querySelector("meta[name='user_id']").content;
const maxPODs = document.head.querySelector("meta[name='user_slots']").content;

const serviceSettings = document.getElementById('serviceSettings')
const serviceSettingsModal = new bootstrap.Modal(serviceSettings)


function create_service_row(service, row_n) {
    const new_row = document.getElementById('service-row').content.cloneNode(true).childNodes[1];

    new_row.children[0].textContent = row_n;
    new_row.children[1].textContent = service.name;
    new_row.children[2].children[0].textContent = service.ingress;
    new_row.children[2].children[0].href = 'http://' + service.ingress;

    new_row.children[3].children[0].textContent = `${service.replicas} / ${service.replicas}`;

    new_row.children[4].children[0].onclick = () => openServiceSettings(service);

    new_row.children[5].children[0].children[0].children[0].setAttribute('onclick', `toggle_service(this, '${service.name}')`);
    new_row.children[6].setAttribute('onclick', `delete_service('${service.name}')`);


    if (service.active) {
        // set class to active
        new_row.className = '';
        new_row.children[5].children[0].children[0].children[0].checked = true;
    }

    return new_row;
}

async function update_service_table() {
    const table = document.getElementById('service-table');

    const services = await fetch(`/api/v1/users/${userID}/services`, { headers: {'CSRF-Token': csrfToken}, method: 'GET', credentials: 'include' })
        .then(res => {
            if (res.status == 304) {
                return [];
            } else {
                return res.json();
            }
        });

    const last_row = table.rows[table.rows.length - 1].cloneNode(true);
    const new_rows = services.map((s, i) => create_service_row(s, i));

    last_row.children[0].textContent = new_rows.length;
    new_rows.push(last_row);
    
    table.children[1].replaceChildren(...Array.from(new_rows));
}

function create_service(service) {
    fetch(`/api/v1/users/${userID}/services`, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'CSRF-Token': csrfToken
        },
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(service)
    })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function update_service(service) {
    fetch(`/api/v1/users/${userID}/services/${service.name}`, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'CSRF-Token': csrfToken
        },
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(service)
    })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function toggle_service(target, id) {
    console.log(target.checked);
    if (target.checked) {
        start_service(id);
    }
    else {
        stop_service(id);
    }
}

function start_service(id) {
    fetch(`/api/v1/users/${userID}/services/${id}/start`, { headers: {'CSRF-Token': csrfToken}, method: 'POST', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function stop_service(id) {
    fetch(`/api/v1/users/${userID}/services/${id}/stop`, { headers: {'CSRF-Token': csrfToken}, method: 'POST', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function delete_service(id) {
    fetch(`/api/v1/users/${userID}/services/${id}`, { headers: {'CSRF-Token': csrfToken}, method: 'DELETE', credentials: 'include' })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

update_service_table();

function openServiceSettings(service) {
    const form = serviceSettings.getElementsByTagName("form")[0];
    form.reset();

    console.log(form)

    if (service) {
        form.elements.name.value = service.name;
        form.elements.replicas.value = service.replicas;
        form.elements.port.value = service.port;
        form.elements.image.value = service.image;
    }


    serviceSettingsModal.show();
}

function validateServiceSettings() {
    return true;
}

function saveServiceSettings(form) {
    if (!validateServiceSettings()) return;

    var service = {
        name: form.elements.name.value,
        replicas: form.elements.replicas.valueAsNumber,
        port: form.elements.port.valueAsNumber,
        image: form.elements.image.value
    }

    console.log(service);

    if (service.name == "") {
        service.name = document.getElementById('service-name').value;
        document.getElementById('service-name').value = "";

        create_service(service);
    } else {
        update_service(service);
    }


    serviceSettingsModal.hide();
}