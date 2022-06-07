// populate database with plans
var plans = [
    {
        name: 'Free',
        price: 0,
        duration: 30,
        slots: 4,
        description: 'Free plan for 30 days with 4 slots'
    },
    {
        name: 'Basic',
        price: 10,
        duration: 30,
        slots: 8,
        description: 'Basic plan for 30 days with 8 slots'
    },
    {
        name: 'Pro',
        price: 20,
        duration: 30,
        slots: 12,
        description: 'Pro plan for 30 days with 12 slots'
    }];

module.exports = function(mongoose) {
    const Plan = mongoose.model('Plan');

    // populate database with plans
    Plan.find({}, function(err, _plans) {
        if (err) {
            console.log(err);
        } else {
            if (_plans.length === 0) {
                plans.forEach(function(plan) {
                    var newPlan = new Plan({
                        name: plan.name,
                        price: plan.price,
                        duration: plan.duration,
                        slots: plan.slots,
                        description: plan.description
                    });
                    newPlan.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            }
        }
    });
}

