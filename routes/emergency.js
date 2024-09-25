const express = require("express");

const { verifyJWT, allowedTo } = require("../middleware/verifyJWT");
const {
  createEmergency,
  uploadEmerMedia,
  getEmergencies,
  toggleEmergencyStatus,
  emergenciesInfo,
} = require("../controllers/emergency");

const router = express.Router();

router.use(verifyJWT);
router
  .route("/")
  .post(uploadEmerMedia, createEmergency)
  .get(allowedTo("admin"), getEmergencies);
router.route("/:id").patch(allowedTo("admin"), toggleEmergencyStatus);
router.route("/info").get(allowedTo("admin"), emergenciesInfo);

module.exports = router;
