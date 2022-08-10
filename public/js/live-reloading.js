const csrfToken = document.head.querySelector("meta[name='csrf-token']").content;
const maxPODs = document.head.querySelector("meta[name='user_slots']").content;

const serviceSettings = document.getElementById("serviceSettings");
const serviceSettingsModal = new bootstrap.Modal(serviceSettings);

const services_table = document.getElementById("services-table");

const service_row_template = document.getElementById("service-row").content;

var services = [];
var services_following_logs = [];

function create_service_row(service, row_n) {
    const service_row = service_row_template.cloneNode(true);

    const service_id = service_row.querySelector("[role=service-id]");
    const service_name = service_row.querySelector("[role=service-name]");
    const service_uri = service_row.querySelector("[role=service-uri]");
    const service_replicas = service_row.querySelector("[role=service-replicas]");
    const service_settings = service_row.querySelector("[role=service-settings]");
    const service_activate = service_row.querySelector("[role=service-activate]");
    const service_delete = service_row.querySelector("[role=service-delete]");
    const service_toggle_logs = service_row.querySelector("[role=service-toggle-logs]");

    const service_logs = service_row.querySelector(".service-logs");

    service_id.textContent = row_n;

    service_name.textContent = service.name;

    service_uri.children[0].textContent = service.ingress;
    service_uri.children[0].href = "http://" + service.ingress;

    service_replicas.children[0].textContent = `${service.replicas} / ${service.replicas}`;

    service_settings.children[0].onclick = () => open_service_settings(service);

    service_activate.children[0].children[0].children[0].setAttribute("onclick", `toggle_service(this, "${service.name}")`);

    service_delete.onclick = () => delete_service(service.name);

    // collapse logs
    service_logs.setAttribute("id", `service-logs-${service.name}`);

    let service_logs_collapse = service_logs.querySelector(".collapse");

    service_logs_collapse.addEventListener("show.bs.collapse", () => {
        update_service_logs(service);
        services_following_logs.push(service.name);
    });

    service_logs_collapse.addEventListener("hide.bs.collapse", () => {
        services_following_logs.splice(services_following_logs.indexOf(service.name), 1);
    })

    service_logs_collapse = new bootstrap.Collapse(service_logs_collapse, {
        toggle: false
    })

    // connect logs toggle with click event
    service_toggle_logs.onclick = () => service_logs_collapse.toggle();


    if (service.active) {
        // set class to active
        service_row.className = "";
        service_activate.children[0].children[0].children[0].checked = true;
    }

    return service_row;
}

async function update_service_table() {
    services = await fetch(`/api/v1/services`, { headers: { "CSRF-Token": csrfToken }, method: "GET", credentials: "include" }).then((res) => {
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
            "CSRF-Token": csrfToken,
        },
        method: "POST",
        credentials: "include",
        body: JSON.stringify(service),
    })
        .then((_) => update_service_table())
        .catch((e) => console.log(e))
        .finally(() => {
            serviceNameInput.value = "";
            serviceSettingsModal.hide();
        });
}

function update_service(service) {
    fetch(`/api/v1/services/${service.name}`, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "CSRF-Token": csrfToken,
        },
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(service),
    })
        .then((_) => update_service_table())
        .catch((e) => console.log(e))
        .finally(() => {
            serviceSettingsModal.hide();
        });
}

function update_service_following_logs() {
    services_following_logs.forEach((s) => update_service_logs(s));
}

function update_service_logs(service) {
    fetch(`/api/v1/services/${service.name}/logs`, { headers: { "CSRF-Token": csrfToken }, method: "GET", credentials: "include" })
        .then((res) => res.text())
        .then((logs) => {
            const service_logs = document.getElementById(`service-logs-${service.name}`);
            service_logs.children[0].children[0].children[0].textContent = logs;
        })
        .catch((e) => console.log(e));
}

function toggle_service(target, id) {
    if (target.checked) {
        start_service(id);
    } else {
        stop_service(id);
    }
}

function start_service(id) {
    fetch(`/api/v1/services/${id}/start`, { headers: { "CSRF-Token": csrfToken }, method: "POST", credentials: "include" })
        .then((_) => update_service_table())
        .catch((e) => console.log(e));
}

function stop_service(id) {
    fetch(`/api/v1/services/${id}/stop`, { headers: { "CSRF-Token": csrfToken }, method: "POST", credentials: "include" })
        .then((_) => update_service_table())
        .catch((e) => console.log(e));
}

function delete_service(id) {
    fetch(`/api/v1/services/${id}`, { headers: { "CSRF-Token": csrfToken }, method: "DELETE", credentials: "include" })
        .then((_) => update_service_table())
        .catch((e) => console.log(e));
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

        if (services.find((s) => s.name == service_name)) {
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

    return fetch("/api/v1/images/" + image, { headers: { "CSRF-Token": csrfToken }, method: "GET", credentials: "include" }).then((res) => {
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
    validateServiceSettings().then((valid) => {
        if (valid) {
            var service = {};
            for (const elem of form.elements) {
                if (elem.name) {
                    service[elem.name] = elem.value;
                }
            }

            // check if service already exists
            if (services.find((s) => s.name == service.name)) {
                update_service(service);
            } else {
                create_service(service);
            }
        }
    });
}

update_service_table();

// stats
limits = {};
(function () {
    fetch("/subscription", { headers: { "CSRF-Token": csrfToken }, method: "GET", credentials: "include" })
        .then((res) => res.json())
        .then((res) => {
            limits = {
                cpu: res.limits.cpu,
                mem: res.limits.mem,
            };
        })
        .catch((e) => console.log(e));
})();

stats = {};
function update_stats() {
    const start = Date.now() - 20 * 1000;

    return fetch("/api/v1/stats?start=" + start, { headers: { "CSRF-Token": csrfToken }, method: "GET", credentials: "include" })
        .then((res) => res.json())
        .then((res) => {
            stats = Object.keys(res).reduce((acc, key) => {
                acc[key] = [];
                res[key].forEach((k) => {
                    acc[key].push(k.value);
                });
                return acc;
            }, {});

            document.dispatchEvent(new CustomEvent("stats_update"));
        })
        .catch((e) => console.log(e));
}
