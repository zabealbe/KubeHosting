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
    }, // .yaml  // the configuration file of the service that makes the service work
    active: {
        type: Boolean,
        required: true
    }, // explain if the service is active (playing) or not (stopped)
    replicas: Number,   // number of replicas
    start_service: Date, // date time service activation
    inExecution: {type: Boolean, default: false}    // explain if a service is in execution, set by default to stop
});

module.exports = mongoose.model('Service', serviceSchema);