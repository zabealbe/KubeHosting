// populate database with plans
var plans = [
    {
        name: 'Free',
        price: 0,
        duration: 30,
        limits: {
            slots: 4,
            cpu: '0.2',
            mem: '800',
        },
        description: 'Free plan for 30 days with 1 slot'
    },
    {
        name: 'Basic',
        price: 10,
        duration: 30,
        limits: {
            slots: 8,
            cpu: '1',
            mem: '4000',
        },
        description: 'Basic plan for 30 days with 5 slots'
    },
    {
        name: 'Pro',
        price: 20,
        duration: 30,
        limits: {
            slots: 12,
            cpu: '2',
            mem: '8000',
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

