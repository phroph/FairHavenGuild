var express = require('express');
var request = require('request');
var path = require('path');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/icons/:name', function(req, res) {
  var p = path.join(__dirname, '..\\icons', req.params.name.toLowerCase().concat('.png'));
  console.log(p);
  fs.exists(p, function(exists){
    if(exists) {
      res.sendFile(p);
    } else {
      res.status(404).send("Icon not found.");
    }
  });
});

router.get('/character/:realm/:name', function(req, res) {
  res.render('character', { realm:req.params.realm, name:req.params.name});
});

router.get('/characterIcon/*', function(req, res) {
  request.get('http://us.battle.net/static-render/us/'.concat(req.params[0])).pipe(res);
});

module.exports = router;
