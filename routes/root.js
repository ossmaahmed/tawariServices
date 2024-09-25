const path = require("path");

const express = require("express");

const router = express.Router();

router.get("^/$|index(.html)?", (req, res) => {
  //  This will match / and /index and /index.html
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
