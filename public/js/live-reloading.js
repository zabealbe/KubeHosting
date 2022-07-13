const csrfToken = document.head.querySelector("meta[name='csrf-token']").content;
const maxPODs = document.head.querySelector("meta[name='user_slots']").content;

const serviceSettings = document.getElementById("serviceSettings");
const serviceSettingsModal = new bootstrap.Modal(serviceSettings);

const services_table = document.getElementById("services-table");

const service_row_template = document.getElementById("service-row").content;

var services = [];
var service_expanded = undefined;

function create_service_row(service, row_n) {
    const service_row = service_row_template.cloneNode(true);
    
    const service_id = service_row.querySelector("[role=service-id]");
    const service_name = service_row.querySelector("[role=service-name]");
    const service_uri = service_row.querySelector("[role=service-uri]");
    const service_replicas = service_row.querySelector("[role=service-replicas]");
    const service_settings = service_row.querySelector("[role=service-settings]");
    const service_activate = service_row.querySelector("[role=service-activate]");
    const service_delete = service_row.querySelector("[role=service-delete]");
    const service_toggle_extra = service_row.querySelector("[role=service-toggle-extra]");

    const service_extra = service_row.querySelector(".service-extra");

    service_id.textContent = row_n;
    
    service_name.textContent = service.name;

    service_uri.children[0].textContent = service.ingress;
    service_uri.children[0].href = "http://" + service.ingress;

    service_replicas.children[0].textContent = `${service.replicas} / ${service.replicas}`;

    service_settings.children[0].onclick = () => open_service_settings(service);

    service_activate.children[0].children[0].children[0].setAttribute("onclick", `toggle_service(this, "${service.name}")`);
    service_delete.setAttribute("onclick", `delete_service("${service.name}")`);

    service_row.onclick = () => toggle_service_info(service);

    service_toggle_extra.querySelector("button").setAttribute("data-bs-target", `[data-service-name="${service.name}"] .collapse`);

    service_extra.setAttribute("data-service-name", service.name);
    service_extra.setAttribute("id", `service-extra-${service.name}`)

    if (service.active) {
        // set class to active
        service_row.className = "";
        service_activate.children[0].children[0].children[0].checked = true;
    }

    return service_row;
}

async function update_service_table() {
    services = await fetch(`/api/v1/services`, { headers: {"CSRF-Token": csrfToken}, method: "GET", credentials: "include" })
        .then(res => {
            if (res.status == 304) {
                return [];
            } else {
                return res.json();
            }
        });

    const last_row = services_table.rows[services_table.rows.length - 1].cloneNode(true);
    const new_rows = services.map((s, i) => create_service_row(s, i));

    last_row.children[0].textContent = new_rows.length;
    new_rows.push(last_row);
    
    services_table.children[1].replaceChildren(...Array.from(new_rows));
}

function create_service(service) {
    fetch(`/api/v1/services`, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "CSRF-Token": csrfToken
        },
        method: "POST",
        credentials: "include",
        body: JSON.stringify(service)
    })
        .then(_ => update_service_table())
        .catch(e => console.log(e))
        .finally(() => {
            serviceNameInput.value = "";
            serviceSettingsModal.hide()
        });
}

function update_service(service) {
    fetch(`/api/v1/services/${service.name}`, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "CSRF-Token": csrfToken
        },
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(service)
    })
        .then(_ => update_service_table())
        .catch(e => console.log(e))
        .finally(() => {
            serviceSettingsModal.hide()
        });
}

function toggle_service(target, id) {
    if (target.checked) {
        start_service(id);
    }
    else {
        stop_service(id);
    }
}

function start_service(id) {
    fetch(`/api/v1/services/${id}/start`, { headers: {"CSRF-Token": csrfToken}, method: "POST", credentials: "include" })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function stop_service(id) {
    fetch(`/api/v1/services/${id}/stop`, { headers: {"CSRF-Token": csrfToken}, method: "POST", credentials: "include" })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function delete_service(id) {
    fetch(`/api/v1/services/${id}`, { headers: {"CSRF-Token": csrfToken}, method: "DELETE", credentials: "include" })
        .then(_ => update_service_table())
        .catch(e => console.log(e));
}

function toggle_service_info(service) {
    if (!service) {
        return;
    }

    service_row_extra = row.querySelector(".service-row-extra[data-service-name='" + service.name + "']");

    if (!service_row_extra) {
        return;
    }

    if (service_expanded == service.name) {

    }
    if (service_expanded != service.name) {

    }
}

function open_service_settings(service) {
    const form = serviceSettings.getElementsByTagName("form")[0];
    form.reset();

    if (service) {
        for (const elem of form.elements) {
            if (elem.name) {
                elem.value = service[elem.name];
            }
        }
    } else {
        const serviceNameInput = document.getElementById("serviceNameInput");

        if (!serviceNameInput.checkValidity()) {
            serviceNameInput.reportValidity();
            return;
        }

        const service_name = serviceNameInput.value;

        if (services.find(s => s.name == service_name)) {
            serviceNameInput.setCustomValidity("Service name already exists");
            serviceNameInput.reportValidity();
            serviceNameInput.setCustomValidity("");
            return;
        }
            
        form.elements.name.value = service_name;
    }


    serviceSettingsModal.show();
}

function validateServiceSettings() {
    const form = serviceSettings.getElementsByTagName("form")[0];
    const image = form.elements.image.value;

    return fetch("/api/v1/images/" + image, { headers: {"CSRF-Token": csrfToken}, method: "GET", credentials: "include" })
        .then(res => {
            if (res.status == 200) {
                return true;
            } else {
                form.elements.image.setCustomValidity("Container image not found");
                form.elements.image.reportValidity();
                form.elements.image.setCustomValidity("");

                return false;
            }
        });
}

function saveServiceSettings(form) {
    validateServiceSettings().then(valid => {
        if (valid) {
            var service = {}
            for (const elem of form.elements) {
                if (elem.name) {
                    service[elem.name] = elem.value;
                }
            }

            // check if service already exists
            if (services.find(s => s.name == service.name)) {
                update_service(service);
            } else {
                create_service(service);
            }
        }
    });
}

update_service_table();