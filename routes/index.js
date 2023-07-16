const router = require("express").Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Film Club' });
  });

module.exports = router;
