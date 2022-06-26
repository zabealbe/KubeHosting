const regex = /^(?<repository>[\w.\-_]+((?::\d+|)(?=\/[a-z0-9._-]+\/[a-z0-9._-]+))|)(?:\/|)(?<image>[a-z0-9.\-_]+(?:\/[a-z0-9.\-_]+|))(:(?<tag>[\w.\-_]{1,127})|)$/;

async function getToken(realm, service, scope){
    console.log(`${realm}?service=${service}&scope=${scope}`);
    
    const res = await fetch(`${realm}?service=${service}&scope=${scope}`, { method: "GET", headers: { "Content-Type": "application/json" } })
        .then(res => res.json())
        .catch(err => {
            console.log(err);
            return {};
        });

    return res.token;
}

async function getImage(repo, image, tag, token=null) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${repo}/v2/${image}/manifests/${tag}`, {
        method: "HEAD",
        headers: headers
        }).catch(err => {
            console.log(err);
            return { status: 500 };
        });
        
    return res;
}

exports.getImage = function(req, res, next) {
    let match = regex.exec(req.params.image);
    
    if (!match) {
        res.status(400).send({'error': 'Invalid image'});
    } else {
        let repo = match.groups.repository || "https://registry-1.docker.io";
        let image = match.groups.image;
        let tag = match.groups.tag || "latest";

        if (!image.includes("/")) {
            image = `library/${image}`;
        }

        // add https:// to the repo if it's not there
        if (!repo.startsWith("http")) {
            repo = `https://${repo}`;
        }

        getImage(repo, image, tag).then(repo_res => {
            switch (repo_res.status) {
                case 200:
                    res.status(200).send({'message': 'Image found'});
                    break;
                case 404:
                    res.status(404).send({'error': 'Image not found'});
                    break;
                case 401:
                    let auth = repo_res.headers.get("www-authenticate");
                    if (!auth) {
                        console.error("No WWW-Authenticate header");
                        res.status(500).send({'error': 'Unable to get token for repository'});
                        return;
                    }

                    // get realm, service and scope from the WWW-Authenticate header
                    auth = auth.split(' ')[1].split(',').reduce((acc, cur) => {
                        let [key, value] = cur.split('=');
                        acc[key] = value.replaceAll('"', '');
                        return acc;
                    }, {});

                    if (!auth.realm || !auth.service || !auth.scope) {
                        console.error("Invalid WWW-Authenticate header");
                        res.status(500).send({'error': 'Unable to get token for repository'});
                        return;
                    }

                    getToken(auth.realm, auth.service, auth.scope).then(token => {
                        getImage(repo, image, tag, token).then(repo_res => {
                            switch (repo_res.status) {
                                case 200:
                                    res.status(200).send({'message': 'Image found'});
                                    break;
                                case 404:
                                    res.status(404).send({'error': 'Image not found'});
                                    break;
                                default:
                                    res.status(500).send({'error': 'Unable to get token for repository'});
                            }});
                    }).catch(err => {
                        console.error('Error getting token', err);
                        res.status(500).send({'error': 'Unable to get token for repository'});
                    });
                    break;
                default:
                    res.status(500).send({'error': 'Unable to query repository'});
            }
        });
    }
}