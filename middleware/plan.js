function hasEnoughSlots(user_id, next) {
    User.findById(user_id, (err, user) => {
        if (err) {
            next(false);
        } else {
            user.services.reduce((acc, service) => {
                return acc + service.replicas;
            }
        }
    });
}