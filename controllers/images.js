exports.getImage = function(req, res, next) {
    let image = req.params.image.split('/');
    
    if (image.length == 1) {
        image_user = 'library';
        image_name = image[0];
    } else {
        image_user = image[0];
        image_name = image[1];
    }

    image_name = image_name.split(':');

    let image_tag = image_name[1] || 'latest'
    image_name = image_name[0]


    console.log(image_user, image_name, image_tag);
    
    fetch(`https://hub.docker.com/v2/repositories/${image_user}/${image_name}/tags/${image_tag}`, { method: "GET", headers: { "Content-Type": "application/json" } })
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