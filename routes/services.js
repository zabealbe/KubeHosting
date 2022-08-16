var express = require('express');
var router = express.Router();
const { checkSchema, validationResult } = require('express-validator');

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
                req.owner = req.user;
                next();
            } else {
                // check if user exists
                User.findById(req.params.userID, (err, user) => {
                    if (err || !user) {
                        res.status(404).send({ error: 'User not found' });
                    } else {
                        req.owner = user;
                        next();
                    }
                });
            }
        }
    }];

function handleErrors(req, res, next) {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() });
    } else {
        next();
    }
}

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
        },
        image: {
            in: ['body'],
            isString: true,
            trim: true,
            isLength: {
                options: { min: 1, max: 255 },
            },
            errorMessage: 'Invalid container image',
        },
        command: {
            in: ['body'],
            isString: true,
            optional: {
                options: {
                    checkFalsy: true
                }
            },
            isLength: {
                options: {max: 65536},
                errorMessage: 'The length cannot exceed 65536 characters'
            },
            isLength: {
                options: {min: 1},
                errorMessage: 'The length cannot be less than 1 character'
            },
            errorMessage: 'Invalid entrypoint',
        },
        args: {
            in: ['body'],
            isString: true,
            optional: {
                options: {
                    checkFalsy: true
                }
            },
            customSanitizer: {
                options: (value) => {
                    return value.split(' ');
                }
            },
        },
        env: {
            in: ['body'],
            isObject: true,
            optional: {
                options: {
                    checkFalsy: true
                }
            }
        }
    }),
    handleErrors, 
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
    handleErrors,
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
    handleErrors,
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
    handleErrors,
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
    handleErrors,
    servicesController.stopService);

    router.get(['/users/:userID/services/:serviceID/logs', '/services/:serviceID/logs'],
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
    handleErrors,
    servicesController.getServiceLogs);

    router.get(['/users/:userID/services/:serviceID/stats', '/services/:serviceID/stats'],
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
        start: {
            in: ['query'],
            isInt: true,
            optional: true,
            min: 1,
            errorMessage: 'Start time must be valid Unix timestamp greater than 0'
        },
        end: {
            in: ['query'],
            isInt: true,
            optional: true,
            min: 1,
            errorMessage: 'End time must be valid Unix timestamp greater than 0'
        }

    }),
    handleErrors,
    (req, res, next) => {
        if (!req.query.start) req.query.start = Date.now() - (24 * 60 * 60 * 1000);
        if (!req.query.end) req.query.end = Date.now();

        req.query.step = (req.query.end - req.query.start) / 1000 + 'ms';

        if (req.query.start > req.query.end) {
            res.status(400).json({
                error: 'Start time must be before end time'
            });
        } else {
            next();
        }
    },
    servicesController.getServiceStats);

    router.get(['/users/:userID/stats', '/stats'],
    sanitize,
    checkSchema({
        start: {
            in: ['query'],
            isInt: true,
            toInt: true,
            optional: true,
            min: 1,
            errorMessage: 'Start time must be valid Unix timestamp greater than 0'
        },
        end: {
            in: ['query'],
            isInt: true,
            toInt: true,
            optional: true,
            min: 1,
            errorMessage: 'End time must be valid Unix timestamp greater than 0'
        },
        step: {
            in :['query'],
            isInt: true,
            toInt: true,
            optional: true,
            min: 1,
            errorMessage: 'Step must be a positive integer expressed in seconds'
        }
    }),
    handleErrors,
    (req, res, next) => {
        if (!req.query.start) req.query.start = Date.now() - (24 * 60 * 60 * 1000);
        if (!req.query.end) req.query.end = Date.now();

        const steps = 1000;
        const min_resolution = 1; // seconds

        if (!req.query.step) req.query.step = Math.max(min_resolution, Math.floor((req.query.end - req.query.start) / 1000 / steps));

        if (req.query.start > req.query.end) {
            res.status(400).json({
                error: 'Start time must be before end time'
            });
        } else {
            next();
        }
    },
    servicesController.getStats);

module.exports = router