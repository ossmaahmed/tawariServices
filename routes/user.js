const express = require("express");

const {
  changePassword,
  changeUserInfo,
  uploadProfileImage,
  resizeUserImage,
  getUserInfo,
  getUsers,
} = require("../controllers/user");
const { verifyJWT, allowedTo } = require("../middleware/verifyJWT");

const router = express.Router();

router.use(verifyJWT);

router
  .route("/")
  .put(uploadProfileImage, resizeUserImage, changeUserInfo)
  .get(getUserInfo);
router.route("/changePassword").patch(changePassword);

router.get("/all", allowedTo("admin"), getUsers);

module.exports = router;
