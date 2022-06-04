var express = require('express');
var router = express.Router();

// =====================================
// HOME PAGE (with login links) ========
// =====================================
router.get('/', function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
});

module.exports = router;