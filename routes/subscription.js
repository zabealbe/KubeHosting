var express = require("express");
var router = express.Router();
const { checkAuthenticated } = require("../middleware/auth");
const { checkSchema, validationResult } = require("express-validator");

var Plan = require("../models/plan");

router.get("/plans", function (req, res) {
    Plan.find({}, function (err, plans) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.status(200).json(plans);
        }
    });
});

router.post(
    "/subscibe",
    checkAuthenticated,
    checkSchema({
        plan: {
            in: ["body"],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: "Plan type must be between 1 and 16 characters",
            },
        },
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
        } else {
            next();
        }
    },
    (req, res, next) => {
        const plan = req.body.plan;

        Plan.findOne({ name: plan }, (err, plan) => {
            if (err) {
                res.status(500).send({ error: err });
            } else if (!plan) {
                res.status(404).send({ error: "Plan not found" });
            } else {
                req.user.plan = {
                    plan: plan._id,
                    start_date: new Date(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + plan.duration)),
                };
                req.user.save((err) => {
                    if (err) {
                        res.status(500).send({ error: err });
                    } else {
                        res.status(200).send({ message: "Subscription successful" });
                    }
                });
            }
        });
    }
);

router.get("/subscription", checkAuthenticated, (req, res) => {
    req.user.getPlan().then((plan) => {
            res.status(200).send(plan);
        }).catch((err) => {
            res.status(500).send({ error: "There was an error during the fetching of the plan" });
        });
});

module.exports = router;
