const express = require("express");

const { login, signup } = require("../controllers/auth");
const loginLimit = require("../middleware/loginLimiter");

const router = express.Router();

router.route("/login").post(loginLimit, login);
router.route("/signup").post(signup);

module.exports = router;
