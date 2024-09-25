const multer = require("multer");

const ApiError = require("../utils/apiError");

const storage = multer.memoryStorage();
const filter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images allowed", 400), false);
  }
};

const uploadImage = (fileName) => {
  const upload = multer({ storage, fileFilter: filter });
  return upload.single(fileName);
};

module.exports = uploadImage;
