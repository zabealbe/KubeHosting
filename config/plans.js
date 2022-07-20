// populate database with plans
var plans = [
    {
        name: 'Free',
        price: 0,
        duration: 30,
        resources: {
            slots: 4,
            cpu: '200m',
            ram: '800Mi',
        },
        description: 'Free plan for 30 days with 1 slot'
    },
    {
        name: 'Basic',
        price: 10,
        duration: 30,
        resources: {
            slots: 8,
            cpu: '1000m',
            ram: '4000Gi',
        },
        description: 'Basic plan for 30 days with 5 slots'
    },
    {
        name: 'Pro',
        price: 20,
        duration: 30,
        resources: {
            slots: 12,
            cpu: '2000m',
            ram: '8Gi',
        },
        description: 'Pro plan for 30 days with 1 slots'
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

