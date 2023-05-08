var mongoose = require("mongoose");
const UserModel = mongoose.model("User");
var passport = require("passport");

function register(userReq, res, next) {
  let user = new UserModel();

  user.username = userReq.username;
  user.email = userReq.email;
  user.setPassword(userReq.password);

  user
    .save()
    .then(function () {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
}

function login(userReq, req, res, next) {
  if (!userReq.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }

  if (!userReq.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  // TODO move this to middleware
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }

      if (user) {
        user.token = user.generateJWT();
        return res.json({ user: user.toAuthJSON() });
      } else {
        return res.status(422).json(info);
      }
    }
  )(req, res, next);
}

function user(userReq, res, next) {  //Refactor user 
  User.findById(userReq.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
}

module.exports = { register, login, user };
