var router = require("express").Router();
router.use("/", require("./users"));
router.use("/profiles", require("./profiles"));
router.use("/articles", require("./articles"));
router.use("/tags", require("./tags"));

router.use(function (err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});
router.get("/", function (req, res, next) {
  Article.find()
    .distinct("tagList")
    .then(function (tags) {
      return res.json({ tags: tags });
    })
    .catch(next);
});

module.exports = router;
