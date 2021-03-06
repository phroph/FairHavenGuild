var express = require('express');
var passport = require('passport')
var Account = require('../models/account');
var request = require('request');
var path = require('path');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  console.log("Current user: " + req.user);
  res.render('index', { title: 'Express' });
});

router.get('/icons/:name', function(req, res) {
  var p = path.join(__dirname, '../icons', req.params.name.toLowerCase().concat('.png'));
  console.log(p);
  fs.exists(p, function(exists){
    if(exists) {
      res.sendFile(p);
    } else {
      res.status(404).send("Icon not found.");
    }
  });
});

router.get('/register', function(req, res) {
  res.render('register', {});
})

router.get('/character/:realm/:name', function(req, res) {
  res.render('character', { realm:req.params.realm, name:req.params.name});
});

router.get('/characterIcon/*', function(req, res) {
  request.get('http://us.battle.net/static-render/us/'.concat(req.params[0])).pipe(res);
});

router.get('/login', function(req, res) {
  res.render('login', {});
})

router.get('/error/:code/:character', function(req, res) {
  res.render('characterError', { code:req.params.code, character:req.params.character });
})

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', { account : account });
    }

    passport.authenticate('local')(req, res, function () {
      console.log("created user");
      res.redirect('/');
    });
  });
});

router.get('/logout', function(req, res){
  if(req.user) {
    console.log("User is logged in, logging out.");
    req.logout();
  }
  res.redirect('/');
});

router.get('/profile/character', function(req, res) {
  res.render('playerCharacter', {});
});

router.get('/auth/bnet',
    passport.authorize('bnet', { scope : 'wow.profile' }));

router.get('/auth/bnet/callback',
    passport.authorize('bnet', { scope : 'wow.profile', failureRedirect: '/' }),
    function(req, res){
      console.log("BNet Connect Successful");
      res.render('index', { title: 'Success!' });
    });

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('Successfully logged in: ' + req.user.username);
  res.redirect('/');
});

module.exports = router;
