const express = require('express')
const router = express.Router();
const userController = require("../controllers/user_controller");

router.get("/get-all-users", userController.findAll);
router.post("/sign-up", userController.create);
router.post("/login", userController.login);
module.exports = router;
