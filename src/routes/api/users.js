var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");

var User = mongoose.model("User");
var auth = require("../auth");
const { register, login, user } = require("../../services/user.service");

router.post("/users", function (req, res, next) {
  const userReq = req.body.user;

  register(userReq, res, next);
});

router.post("/users/login", function (req, res, next) {
  const userReq = req.body.user;

  login(userReq, req, res, next);
});

router.get("/user", auth.required, function (req, res, next) {
  //рефактор user
  const userReq = req.body.user;

  user(userReq, req, res, next);
});

router.put("/user", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function () {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});
module.exports = router;
