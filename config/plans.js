// populate database with plans
var plans = [
    {
        name: 'Free',
        price: 0,
        duration: 30,
        resources: {
            slots: 4,
            cpu: '200m',
            ram: '500Mi',
        },
        description: 'Free plan for 30 days with 4 slots'
    },
    {
        name: 'Basic',
        price: 10,
        duration: 30,
        resources: {
            slots: 8,
            cpu: '200m',
            ram: '500Mi',
        },
        description: 'Basic plan for 30 days with 8 slots'
    },
    {
        name: 'Pro',
        price: 20,
        duration: 30,
        resources: {
            slots: 12,
            cpu: '200m',
            ram: '500Mi',
        },
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
                    var newPlan = new Plan(plan);
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

