var router = require("express").Router();
var passport = require("passport");
var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var User = mongoose.model("User");

function article(userReq, req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var article = new Article(req.body.article);

      article.author = user;

      return article.save().then(function () {
        console.log(article.author);
        return res.json({ article: article.toJSONFor(user) });
      });
    })
    .catch(next);
}

function articleFeed(userReq, req, res, next) {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    Promise.all([
      Article.find({ author: { $in: user.following } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate("author")
        .exec(),
      Article.count({ author: { $in: user.following } }),
    ])
      .then(function (results) {
        var articles = results[0];
        var articlesCount = results[1];

        return res.json({
          articles: articles.map(function (article) {
            return article.toJSONFor(user);
          }),
          articlesCount: articlesCount,
        });
      })
      .catch(next);
  });
}

function articlePut(userReq, req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== "undefined") {
        req.article.title = req.body.article.title;
      }

      if (typeof req.body.article.description !== "undefined") {
        req.article.description = req.body.article.description;
      }

      if (typeof req.body.article.body !== "undefined") {
        req.article.body = req.body.article.body;
      }

      req.article
        .save()
        .then(function (article) {
          return res.json({ article: article.toJSONFor(user) });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
}

function getSlash(userReq, req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }
  if (typeof req.query.tag !== "undefined") {
    query.tagList = { $in: [req.query.tag] };
  }

  Promise.all([
    req.query.author ? User.findOne({ username: req.query.author }) : null,
    req.query.favorited
      ? User.findOne({ username: req.query.favorited })
      : null,
  ])
    .then(function (results) {
      var author = results[0];
      var favoriter = results[1];

      if (author) {
        query.author = author._id;
      }

      if (favoriter) {
        query._id = { $in: favoriter.favorites };
      } else if (req.query.favorited) {
        query._id = { $in: [] };
      }

      return Promise.all([
        Article.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: "desc" })
          .populate("author")
          .exec(),
        Article.count(query).exec(),
        req.payload ? User.findById(req.payload.id) : null,
      ]).then(function (results) {
        var articles = results[0];
        var articlesCount = results[1];
        var user = results[2];

        return res.json({
          articles: articles.map(function (article) {
            return article.toJSONFor(user);
          }),
          articlesCount: articlesCount,
        });
      });
    })
    .catch(next);
}

function getArticle(userReq, req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate("author").execPopulate(),
  ])
    .then(function (results) {
      var user = results[0];

      return res.json({ article: req.article.toJSONFor(user) });
    })
    .catch(next);
}

function articleFavorite(userReq, req, res, next) {
  var articleId = req.article._id;

  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.favorite(articleId).then(function () {
        return req.article.updateFavoriteCount().then(function (article) {
          return res.json({ article: article.toJSONFor(user) });
        });
      });
    })
    .catch(next);
}

function articleUnFavorite(userReq, req, res, next) {
  var articleId = req.article._id;

  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfavorite(articleId).then(function () {
        return req.article.updateFavoriteCount().then(function (article) {
          return res.json({ article: article.toJSONFor(user) });
        });
      });
    })
    .catch(next);
}

module.exports = {
  article,
  articleFeed,
  articlePut,
  getSlash,
  getArticle,
  articleFavorite,
  articleUnFavorite,
};
