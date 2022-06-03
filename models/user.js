// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define schema for purchased plan
var planPurchasedSchema = mongoose.Schema({
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    start_date: {
        type: Date,
        required: Date.now
    },
    end_date: Date   // calculated by a function EndSub(start_sub, sub_duration)
})

// define schema for service
const serviceSchema = mongoose.Schema({
    config: {           // the config for the service, must have the format of a k8s replication controller
        type: Object,
        required: true        
    },
    active: {            // explain if the service is active (playing) or not (stopped)
        type: Boolean,
        required: true
    },
    deploy_date: Date, // date time service activation
    launch_date: Date, // date time service activation
}, {
    autoindex: false
});
serviceSchema.virtual('name').get(function() {
    return this.config.metadata.name;
});
serviceSchema.virtual('replicas').get(function() {
    return this.config.spec.replicas;
}).set(function() {
    this.config.spec.replicas = this.replicas;
});

// define the schema for our user model
var userSchema = mongoose.Schema({

    local : {
        email        : {
            type: String,
            required: true,
            unique: true,
        },
        password     : {
            type: String,
            required: true
        },
    },
    services : [                    // array of services of the user
        serviceSchema
    ],
    plan : planPurchasedSchema,     //plan object of the the plan purchased by the user
    blocked : {                     // an user is blocked when insert wrong password for 3 times in a row
        type: Boolean,
        default: false
    },
    start_blocked : Date,           // capture the moment when the user is blocked
    time_blocked : Number,          // minute unit
    name : String,                  // not required at registration
    surname : String,               // not required at registration
    vat: String,                    // not required at registration ("Partita IVA")
});

userSchema.virtual('free_slots').get(function() {
    return this.plan.plan.slots - this.services.reduce((acc, service) => {
        return acc + service.active ? service.config.spec.replicas : 0;
    }, 0);
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
