var router = require("express").Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");

function getUsername(userReq, req, res, next) {
  if (req.payload) {
    User.findById(req.payload.id).then(function (user) {
      if (!user) {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
      }

      return res.json({ profile: req.profile.toProfileJSONFor(user) });
    });
  } else {
    return res.json({ profile: req.profile.toProfileJSONFor(false) });
  }
}
function userFollow(userReq, req, res, next) {
  var profileId = req.profile._id;

  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.follow(profileId).then(function () {
        return res.json({ profile: req.profile.toProfileJSONFor(user) });
      });
    })
    .catch(next);
}

module.exports = { getUsername, userFollow };
