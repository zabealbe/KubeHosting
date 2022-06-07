// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const kubernetesController = require('../controllers/kubernetes');

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
    name: {
        type: String,
        required: true
    },
    active: {            // explain if the service is active (playing) or not (stopped)
        type: Boolean,
        required: true
    },
    ingress: {
        type: String,
        required: false
    },
    replicas: {          // the number of replicas of the service
        type: Number,
        required: true
    },
    port: {             // the ports of the service
        type: Number,
        required: true
    },
    image: {             // the image of the service
        type: String,
        required: true
    },
    deploy_date: Date,   // date time service activation
    launch_date: Date,   // date time service activation
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
    is_admin: {
        type: Boolean,
        required: false
    },
    is_blocked : {                     // an user is blocked when insert wrong password for 3 times in a row
        type: Boolean,
        default: false
    },
    start_blocked : Date,            // capture the moment when the user is blocked
    time_blocked : Number,           // in minutes
    username: String,                // not required at registration
    firstname : String,              // not required at registration
    lastname : String,               // not required at registration
    phone: String,                   // not required at registration
    //vat: String,                     // not required at registration ("Partita IVA")
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

// add callback when user is created
userSchema.pre('save', function(next) {
    if (this.isNew) {
        kubernetesController.createNamespace(this._id).then(() => {
            next();
        }).catch(err => {
            next(err);
        });
    } else {
        next();
    }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
