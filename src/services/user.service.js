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

function login() {
  
}

module.exports = { register, login };
