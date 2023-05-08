var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");

var User = mongoose.model("User");
var auth = require("../auth");
const {
  register,
  login,
  user,
  userput,
} = require("../../services/user.service");

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
  const userReq = req.body.user;

  userput(userReq, req, res, next);
});
module.exports = router;
