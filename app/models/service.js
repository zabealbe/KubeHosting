// load the things we need
var mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    config: {
        type: String,
        required: true        
    }, // .yaml
    active: {
        type: Boolean,
        required: true
    },
});

module.exports = mongoose.model('Service', serviceSchema);
