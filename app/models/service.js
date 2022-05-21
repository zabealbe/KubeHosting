const mongoose = require('mongoose')

const serviceSchema = mongoose.Schema({
    name: String,
    config: String, // .yaml
    active: Boolean
});

module.exports = mongoose.model('Service', serviceSchema);
