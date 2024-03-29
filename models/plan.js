const mongoose = require('mongoose');

// define schema for plan
var planSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 1,
        max: 16,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    resources: {
        slots: {
            type: Number,
            required: true
        },
        cpu: {
            type: String,
            required: true
        },
        ram: {
            type: String,
            required: true
        }
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Plan', planSchema);
