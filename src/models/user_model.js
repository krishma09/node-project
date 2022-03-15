const bcrypt = require("bcryptjs");
var db = require("./../../config/db.config");

var User = function (user) {
  this.user_id = user.user_id;
  this.user_name = user.user_name;
  this.user_email = user.user_email;
  this.user_password = user.user_password;
  this.user_profile_image = user.user_profile_image;
  this.user_birthdate = user.user_birthdate;
};

User.create = function (newUser, result) {
  db.query("INSERT INTO user_data set ?", newUser, function (err, res) {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        result(
          {
            error_code: 409,
            error: "true",
            message: "User already exixts!!!",
          },
          null
        );
      } else result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

User.login = function (req, result) {
  db.query(
    "Select * from user_data where user_email = ?",
    [req.body.user_email],
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        if (Object.keys(res).length === 0) {
          result(
            {
              error_code: 404,
              error: true,
              message: "User Not Found. Please register with this email",
            },
            null
          );
        } else {
          const isPasswordValid = bcrypt.compareSync(
            req.body.user_password,
            res[0].user_password
          );
          if (!isPasswordValid) {
            result(
              {
                error_code: 401,
                error: true,
                message: "Incorrect Password",
              },
              null
            );
          } else result(null, res);
        }
      }
    }
  );
};

User.findAll = function (result) {
  db.query("Select * from user_data", function (err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

module.exports = User;
