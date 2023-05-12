const router = require("express").Router();
const passport = require("passport");
const mongoose = require("mongoose");

const Article = mongoose.model("Article");
const User = mongoose.model("User");
const Comment = mongoose.model("Comment");
const auth = require("../auth");

const {
  article,
  articleFeed,
  articlePut,
  getSlash,
  getArticle,
  articleFavorite,
  articleUnFavorite,
  createComment,
} = require("../../services/article.service");

router.param("article", function (req, res, next, slug) {
  Article.findOne({ slug: slug })
    .populate("author")
    .then(function (article) {
      if (!article) {
        return res.sendStatus(404);
      }

      req.article = article;

      return next();
    })
    .catch(next);
});

router.post("/", auth.required, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  article(userReq, req, res, next);
});

router.put("/:article", auth.required, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  articlePut(userReq, req, res, next);
});

router.delete("/:article", auth.required, function (req, res, next) {
  // не работает роут
  User.findById(req.payload.id).then(function () {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      return req.article.remove().then(function () {
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

router.post("/:article/favorite", auth.required, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  articleFavorite(userReq, req, res, next);
});

// Unfavorite an article
router.delete("/:article/favorite", auth.required, function (req, res, next) {
  //Refactor
  const userReq = req.body.user;

  articleUnFavorite(userReq, req, res, next);
});

router.post("/:article/comments", auth.required, function (req, res, next) {
  //Refactor
  const userReq = req.body.user;

  createComment(userReq, req, res, next);
});

router.get("/:article/comments", auth.optional, function (req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(function (user) {
      return req.article
        .populate({
          path: "comments",
          populate: {
            path: "author",
          },
          options: {
            sort: {
              createdAt: "desc",
            },
          },
        })
        .execPopulate()
        .then(function (article) {
          console.log("req.article.comments", req.article.comments);
          return res.json({
            comments: req.article.comments.map(function (comment) {
              return comment.toJSONFor(user);
            }),
          });
        });
    })
    .catch(next);
});

router.param("comment", function (req, res, next, id) {
  //не работает
  Comment.findById(id)
    .then(function (comment) {
      if (!comment) {
        return res.sendStatus(404);
      }

      req.comment = comment;

      return next();
    })
    .catch(next);
});

router.delete(
  "/:article/comments/:comment",
  auth.required,
  function (req, res, next) {
    if (req.comment.author.toString() === req.payload.id.toString()) {
      req.article.comments.remove(req.comment._id);
      req.article
        .save()
        .then(Comment.find({ _id: req.comment._id }).remove().exec())
        .then(function () {
          res.sendStatus(204);
        });
    } else {
      res.sendStatus(403);
    }
  }
);

router.get("/", auth.optional, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  getSlash(userReq, req, res, next);
});

router.get("/feed", auth.required, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  articleFeed(userReq, req, res, next);
});

router.get("/:article", auth.optional, function (req, res, next) {
  //refactor
  const userReq = req.body.user;

  getArticle(userReq, req, res, next);
});

module.exports = router;
