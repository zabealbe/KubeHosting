// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Service  = require('./service');
var PlanPurchased  = require('./plan');

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
    services : [
        Service.schema
    ],  // array of services of the user
    plan : PlanPurchased.schema,    //plan object of the the plan purchased by the user
    blocked : {type: Boolean, default: false},  // an user is blocked when insert wrong password for 3 times in a row
    start_blocked : Date,   // capture the moment when the user is blocked
    time_blocked : Number,  // minute unit
    name : String,  // not required at registration
    surname : String,  // not required at registration
    VAT_id_number: String,  // not required at registration ("Partita IVA")
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
