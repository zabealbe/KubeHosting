var express = require('express');
var router = express.Router();
const { checkSchema, validationResult } = require('express-validator');

var User = require('../models/user');
const servicesController = require('../controllers/services');

const sanitize = [
    checkSchema({
        userID: {
            in: ['params'],
            isMongoId: true,
            errorMessage: 'Invalid user ID',
            optional: true,
            custom: {
                options: (value, { req }) => {
                    return req.user.is_admin || !value;
                },
                errorMessage: 'You are not authorized to access this resource'
            }
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(401).send({ errors: errors.array() });
        } else {
            if (req.params.userID == undefined) {
                req.params.userID = req.user._id;
            }
            next();
        }
    }];

// Creates new service for a user
router.post(['/users/:userID/services/', '/services/'],
    sanitize,
    checkSchema({
        name: {
            in: ['body'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: 'Service name must be between 1 and 50 characters'
            },
        },
        image: {
            in: ['body'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 50 },
                errorMessage: 'Invalid container image',
            }
        },
        replicas: {
            in: ['body'],
            isInt: true,
            min: 1,
            max: 5,
            errorMessage: 'Service replicas must be between 1 and 5',
            toInt: true
        },
        port: {
            in: ['body'],
            isInt: true,
            min: 1,
            max: 65535,
            errorMessage: 'Service port must be between 1 and 65535',
            toInt: true
        }
    }),
    (req, res, next) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
        } else {
            next();
        }
    },            
    servicesController.createService);

// Gets the services created by user
router.get(['/users/:userID/services/', '/services/'],
    sanitize,
    servicesController.listServices);

// Modifies user's service
router.put(['/users/:userID/services/:serviceID', '/services/:serviceID'],
    sanitize,
    checkSchema({
        serviceID: {
            in: ['params'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: 'Service name must be between 1 and 50 characters'
            }
        },
        image: {
            in: ['body'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 50 },
                errorMessage: 'Invalid container image',
            }
        },
        replicas: {
            in: ['body'],
            isInt: true,
            optional: true,
            min: 1,
            max: 10,
            errorMessage: 'Service replicas must be between 1 and 10'
        },
        port: {
            in: ['body'],
            isInt: true,
            optional: true,
            min: 1,
            max: 65535,
            errorMessage: 'Service port must be between 1 and 65535'
        }
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ errors: errors.array() });
        } else {
            next();
        }
    },
    servicesController.updateService);

// Deletes user's service
router.delete(['/users/:userID/services/:serviceID', '/services/:serviceID'],
    sanitize,
    checkSchema({
        serviceID: {
            in: ['params'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: 'Service name must be between 1 and 50 characters'
            }
        }
    }),
    servicesController.deleteService);

// Starts specific service
router.post(['/users/:userID/services/:serviceID/start', '/services/:serviceID/start'],
    sanitize,
    checkSchema({
        serviceID: {
            in: ['params'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: 'Service name must be between 1 and 50 characters'
            }
        }
    }),
    servicesController.startService);

// Stops a specific service
router.post(['/users/:userID/services/:serviceID/stop', '/services/:serviceID/stop'],
    sanitize,
    checkSchema({
        serviceID: {
            in: ['params'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 16 },
                errorMessage: 'Service name must be between 1 and 50 characters'
            }
        }
    }),
    servicesController.stopService);

module.exports = router