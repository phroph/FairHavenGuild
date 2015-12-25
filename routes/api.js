var express = require('express');
var passport = require('passport')
var request = require('request');
var fs = require('fs');
var router = express.Router();

router.get('/wow/user/characters', function(req, res) {
  if(req.user) {
    request.get('https://us.api.battle.net/wow/user/characters?access_token=' + req.user.bnet.token).pipe(res);
  }
});

router.get('/wow/character/:realm/:name', function(req,res) {
  request.get('https://us.api.battle.net/wow/character/' + req.params.realm + '/' + req.params.name + "?fields=items&locale=en_US&apikey=55v24wzgcyt295756q853cmc4hkd9xf2").pipe(res);
})

router.get('/account/user', function(req, res) {
  if(req.user) {
    request.get('https://us.api.battle.net/account/user?access_token=' + req.user.bnet.token).pipe(res);
  }
});

module.exports = router;
