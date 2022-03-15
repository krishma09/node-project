const bcrypt = require("bcryptjs");
const User = require("../models/user_model");

exports.create = function (req, res) {
  const newUser = new User(req.body);
  let userData = req.body;
  let err = checkValidations(userData);

  if (err.status) {
    res.status(400).send({ error: true, message: err.message });
  } else {
    newUser.user_password = bcrypt.hashSync(newUser.user_password, 10);
    User.create(newUser, function (err, user) {
      if (err) {
        if (err.error_code === 409) {
          res
            .status(err.error_code)
            .send({ error: true, message: err.message });
        } else res.send(err);
      } else {
        res.json({
          error: false,
          message: "User added successfully!",
        });
      }
    });
  }
};
exports.findAll = function (req, res) {
  User.findAll(function (err, user) {
    if (err) {
      res.send(err);
    } else {
      user.forEach((element) => {
        delete element.user_id;
        delete element.user_password;
      });
      res.send(user);
    }
  });
};
exports.login = function (req, res) {
  User.login(req, function (err, user) {
    if (err) {
      if (err.error_code) {
        res.status(err.error_code).send({ error: true, message: err.message });
      } else res.send(err);
    } else {
      delete user[0].user_id;
      delete user[0].user_password;

      const userBirthdate = new Date(user[0].user_birthdate);
      const userBirthdayThisYear = new Date(
        new Date().getFullYear(),
        userBirthdate.getMonth(),
        userBirthdate.getDate()
      );
      const addToYear = userBirthdayThisYear > Date.now() ? 0 : 1;
      const oneDay = 24 * 60 * 60 * 1000;
      const secondDate = new Date(
        new Date().getFullYear() + addToYear,
        userBirthdate.getMonth(),
        userBirthdate.getDate()
      );
      const firstDate = new Date();
      const days = Math.round(
        Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
      );
      if (days < 7) {
        const daysOrDay = days === 1 ? "day" : "days";
        let message = `${days} ${daysOrDay} to go for Birthday`;
        user[0].message = message;
      }

      res.json(user);
    }
  });
};

function checkValidations(userData) {
  let err = {
    status: false,
    message: "",
  };
  if (userData.constructor === Object && Object.keys(userData).length === 0) {
    return {
      status: true,
      message: "Please provide all required fields",
    };
  }
  if (userData.user_email) {
    const emailRegexp =
      /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
    let isEmail = emailRegexp.test(userData.user_email);
    if (!isEmail) {
      return {
        status: true,
        message: "Please enter valid Email address",
      };
    }
  } else {
    return {
      status: true,
      message: "Please enter Email address",
    };
  }

  if (userData.user_password) {
    if (userData.user_password.length < 8) {
      return {
        status: true,
        message: "Password length must be greater than 8",
      };
    }

    const passwordRegexp = /^[A-Za-z]\w{7,15}$/;
    let isPasswordValid = passwordRegexp.test(userData.user_password);
    if (!isPasswordValid) {
      return {
        status: true,
        message:
          "Enter proper password (must be 8-15 characters long, start from a letter, can have underscore)",
      };
    }
  } else {
    return {
      status: true,
      message: "Please enter password",
    };
  }

  if (userData.user_name) {
    const nameRegexp = /^[A-Za-z ]+$/;
    let isNameValid = nameRegexp.test(userData.user_name);
    if (!isNameValid) {
      return {
        status: true,
        message: "Name should only contain letters and spaces",
      };
    }
  } else {
    return {
      status: true,
      message: "Please enter user name",
    };
  }

  if (userData.user_profile_image) {
    const allowedExtension = ["jpeg", "jpg", "png", "gif", "bmp"];
    let fileExtension = userData.user_profile_image
      .split(".")
      .pop()
      .toLowerCase();
    let isValidFile = false;

    for (var index in allowedExtension) {
      if (fileExtension === allowedExtension[index]) {
        isValidFile = true;
        break;
      }
    }
    if (!isValidFile) {
      return {
        status: true,
        message: "Please select an image file",
      };
    }
  } else {
    return {
      status: true,
      message: "Please select profile image",
    };
  }

  if (userData.user_birthdate) {
    let isDate =
      new Date(userData.user_birthdate) !== "Invalid Date" &&
      !isNaN(new Date(userData.user_birthdate));
    if (!isDate) {
      return {
        status: true,
        message: "Please enter valid date in format(yyyy-mm-dd)",
      };
    }
    if (new Date(userData.user_birthdate) > Date.now()) {
      return {
        status: true,
        message: "Please enter valid date(Date must not be in future)",
      };
    }
    const dateRegexp = /\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])/;
    let dateFormatValid = dateRegexp.test(userData.user_birthdate);
    if (!dateFormatValid) {
      return {
        status: true,
        message: "Please enter date in format(yyyy-mm-dd)",
      };
    }
  } else {
    return {
      status: true,
      message: "Please enter your birthdate",
    };
  }
  return err;
}
