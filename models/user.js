// load the things we need
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const kubernetesController = require('../controllers/kubernetes');

const Plan = require('../models/plan');

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
    port: {              // the ports of the service
        type: Number,
        required: true
    },
    image: {             // the image of the service
        type: String,
        required: true
    },
    command: {           // the command to run as entrypoint
        type: String,
        required: false,
        default: ''
    },
    args: [{              // the arguments to pass to the service
        type: String,
        required: false,
        default: []
    }],
    env: {               // the environment variables to pass to the service
        type: Object,
        required: false,
        default: {}
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
    services : [                     // array of services of the user
        serviceSchema
    ],
    plan : planPurchasedSchema,      //plan object of the the plan purchased by the user
    is_admin: {
        type: Boolean,
        required: false
    },
    is_blocked : {                   // an user is blocked when insert wrong password for 3 times in a row
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

userSchema.methods.getPlan = function() {
    return Plan.findById(this.plan.plan);
}

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
        this.getPlan().then(plan => {
            kubernetesController.createNamespace(this._id, plan.resources.cpu, plan.resources.ram).then(() => {
                next();
            }).catch(err => {
                next(err);
            });
        }).catch(err => {
            console.log(err);

            next(err);
        });
    } else {
        next();
    }
});

userSchema.pre('findOneAndDelete', function(next) {
    let user_id = this._conditions._id;

    kubernetesController.deleteNamespace(user_id).then(() => {
        next();
    }).catch(err => {
        console.log(err);

        next(err);
    });
});

userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('plan.plan')) {
        this.getPlan().then(plan => {
            kubernetesController.updateResourceQuota(this._id, plan.resources).then(() => {
                next();
            }).catch(err => {
                next(err);
            });
        }).catch(err => {
            console.log(err);

            next(err);
        });
    } else {
        next();
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
