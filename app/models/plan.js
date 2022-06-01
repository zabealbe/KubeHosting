// load the things we need
const mongoose = require('mongoose');

// define the schema for our plan model (plan object that user see in the catalog)
var planSchema = mongoose.Schema({

    name: String,
    price: {type: Number, required: true},
    description: String,    // description of the plan 
    numSlot: {type: Number, required: true},    // number of slot garanted from the plan
    purchasable: {type: Boolean, required: true},  // explain if a plan is purchasable
    sub_duration: Number   // number of month
});

// is the object that is ref to a single user
var planPurchasedSchema = mongoose.Schema({
    plan: {type: mongoose.Schema.Types.ObjectId, ref: 'Plan'},
    start_sub: {type: Date, required: Date.now},
    end_sub: Date   // calculated by a function EndSub(start_sub, sub_duration)
})
// methods ======================

// create the model for plans and expose it to our app
module.exports = mongoose.model('Plan', planSchema);
module.exports = mongoose.model('PlanPurchased', planPurchasedSchema);