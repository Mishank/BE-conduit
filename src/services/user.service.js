var mongoose = require("mongoose");
const UserModel = mongoose.model("User");

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

function login(userReq, res, next) {
  if (!userReq.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }

  if (!userReq.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

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
  )(userReq, res, next);
}

module.exports = { register, login };
