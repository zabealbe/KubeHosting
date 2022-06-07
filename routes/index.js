var express = require('express');
var router = express.Router();
//const passport = require('passport');

// =====================================
// HOME PAGE (with login links) ========
// =====================================
router.get('/', function(req, res) {
    res.render('index.ejs', {
        user: req.user // get the user out of session and pass to template
    });
});

module.exports = router;