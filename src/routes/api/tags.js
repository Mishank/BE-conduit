var router = require("express").Router();
var mongoose = require("mongoose");
var Article = mongoose.model("Article");
const { tag } = require("../../services/tag.service");

router.get("/", function (req, res, next) {
  //Refactor
  const userReq = req.body.user;

  tag(userReq, req, res, next);
});

module.exports = router;
