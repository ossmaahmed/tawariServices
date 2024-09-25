const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/apiError");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "media"));
  },
  filename: function (req, file, cb) {
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype.startsWith("video") ||
      file.mimetype.startsWith("audio") ||
      file.mimetype.startsWith("application")
    ) {
      const fileName = `media-${uuidv4()}.${file.originalname
        .split(".")
        .slice(-1)}`;
      req.body.media = fileName;
      cb(null, fileName);
    } else {
      cb(new ApiError("Only image, video, and voice allowed", 400), null);
    }
  },
});

const checkUploadFoldar = async () => {
  if (!fs.existsSync(path.join(__dirname, "..", "uploads"))) {
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads"));
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads", "media"));
  }
  if (!fs.existsSync(path.join(__dirname, "..", "uploads", "media"))) {
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads", "media"));
  }
};

const uploadMedia = (fileName) => {
  checkUploadFoldar();
  const upload = multer({ storage });
  return upload.single(fileName);
};

module.exports = uploadMedia;
