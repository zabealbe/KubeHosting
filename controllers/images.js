const regex = /^(?<repository>[\w.\-_]+((?::\d+|)(?=\/[a-z0-9._-]+\/[a-z0-9._-]+))|)(?:\/|)(?<image>[a-z0-9.\-_]+(?:\/[a-z0-9.\-_]+|))(:(?<tag>[\w.\-_]{1,127})|)$/;

exports.getImage = function(req, res, next) {
    let match = regex.exec(req.params.image);
    
    if (!match) {
        res.status(400).send({'error': 'Invalid image'});
    } else {
        let repo = match.groups.repository || "";
        let image = match.groups.image;
        let tag = match.groups.tag || "latest";

        if (!image.includes("/")) {
            image = `library/${image}`;
        }
        
        fetch(`https://hub.docker.com/v2/repositories/${image}/tags/${tag}`, { method: "GET", headers: { "Content-Type": "application/json" } })
            .then(reg_res => {
                switch (reg_res.status) {
                    case 200:
                        res.status(200).send(reg_res);
                        break;
                    case 404:
                        res.status(404).send({'error': 'Image not found'});
                        break;
                    default:
                        res.status(500).send({'error': 'Error fetching image'});
                }
            }).catch(err => {
                console.log(err);
                res.status(500).send({'error': 'Error fetching image tags'});
            });
        }
}