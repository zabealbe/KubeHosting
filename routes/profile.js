const express = require('express');
const passport = require('passport');
const { checkAuthenticated } = require('../middleware/auth');
const { checkSchema, validationResult } = require('express-validator');
var User = require('../models/user');

var router = express.Router();

router.use(checkAuthenticated);

// =====================================
// PROFILE SECTION =====================
// =====================================
router.get('/',
    function(req, res) {
        req.user.getPlan().then(user_plan => {
            res.render('profile.ejs', {
                user : req.user, // get the user out of session and pass to template
                user_plan: user_plan,
                message: req.flash('profileMessage')
            });
        });
    });

// =====================================
// UPDATE PROFILE ======================
// =====================================
router.post('/',
    checkSchema({
        username: {
            in: ['body'],
            trim: true,
            isString: true,
            isLength: {
                options: { min: 3, max: 16 },
                errorMessage: 'Username must be between 3 and 16 characters'
            },
            optional: {
                checkFalsy: true
            },
        },
        email: {
            in: ['body'],
            trim: true,
            isString: true,
            isEmail: true,
            errorMessage: 'Invalid email address!',
            optional: {
                checkFalsy: true
            },
        },
        firstname: {
            in: ['body'],
            trim: true,
            isString: true,
            isLength: {
                options: { min: 2, max: 16 },
                errorMessage: 'Firstname must be between 2 and 16 characters'
            },
            errorMessage: 'Invalid first name!',
            optional: {
                checkFalsy: true
            },
        },
        lastname: {
            in: ['body'],
            trim: true,
            isString: true,
            isLength: {
                options: { min: 2, max: 16 },
                errorMessage: 'Lastname must be between 2 and 16 characters'
            },
            errorMessage: 'Invalid last name!',
            optional: {
                checkFalsy: true
            },
        },
        phone: {
            in: ['body'],
            isMobilePhone: true,
            errorMessage: 'Invalid phone number!',
            optional: {
                checkFalsy: true
            },
        },
        bio: {
            in: ['body'],
            isString: true,
            errorMessage: 'Invalid bio!',
            optional: {
                checkFalsy: true
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
    function(req, res, next) {
        const email = req.body.email;
        const user_update = {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            bio: req.body.bio
        }

        User.findOne({ 'local.email': email }, (err, user) => {
            if (user && !user._id.equals(req.user._id)) {
                res.status(400).send({ error: 'That email is already taken.' });
            } else {
                User.findById(req.user._id, (err, user) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: 'Error updating profile.' });
                    } else {
                        Object.assign(user, user_update);
                        if (email)
                            user.local.email = email;

                        user.save((err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ error: 'Error updating profile.' });
                            } else {
                                res.status(200).send({ message: 'Profile updated successfully.' });
                            }});
                    }
                });
            }});
    });

router.post('/password',
    checkSchema({
        oldpassword: {
            in: ['body'],
            isString: true,
            errorMessage: 'Invalid old password!',
        },
        newpassword: {
            in: ['body'],
            isStrongPassword: true,
            errorMessage: 'Password must contain at least 8 characters with at least: \n• 1 lowercase character \n• 1 uppercase character \n• 1 digit \n• 1 simbol',
        },
        confirmnewpassword: {
            in: ['body'],
            custom: {
                options: (value, { req }) => {
                    return value === req.body.newpassword;
                },
                errorMessage: 'New password and confirm new password must match.'
            }
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
        function(req, res) {
            User.findById(req.user._id, (err, user) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: 'Error updating password.' });
                } else {
                    if (!user.validPassword(req.body.oldpassword)) {
                        res.status(400).send({ error: 'Old password is incorrect.', param: 'oldpassword' });
                    } else {
                        user.local.password = user.generateHash(req.body.newpassword);
                        user.save((err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ error: 'Error updating password.' });
                            } else {
                                res.status(200).send({ message: 'Password updated successfully.' });
                            }
                        });
                    }
                }
            });
        });

module.exports = router;