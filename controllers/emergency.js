const path = require("path");
const fs = require("fs");

const detect = require("detect-file-type");

const Emergency = require("../models/Emergency");
const User = require("../models/User");

const ApiError = require("../utils/apiError");
const uploadMedia = require("../middleware/uploadMedia");

const uploadEmerMedia = uploadMedia("media");

const deleteEmerMedia = (req) => {
  if (req.body.media) {
    fs.rmSync(path.join(__dirname, "..", "uploads", "media", req.body.media));
  }
};

const createEmergency = async (req, res, next) => {
  req.body.user = req.userId;
  let { title, user, dispatcher, phone, longitude, latitude, media } = req.body;
  let mediaType;

  await new Promise((resolve, reject) => {
    detect.fromFile(
      path.join(__dirname, "..", "uploads", "media", req.body.media),
      function (err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result.mime.split("/")[0]);
        // return (mediaType = result.mime.split("/")[0]); // { ext: 'jpg', mime: 'image/jpeg' }
      }
    );
  }).then((doc) => (mediaType = doc));

  const userInfo = await User.findById(user).lean().exec();

  if (!title) {
    deleteEmerMedia(req);
    return next(new ApiError("عنوان الطلب اجباري"), 400);
  }

  dispatcher = dispatcher || userInfo.name;
  phone = phone || userInfo.phone;
  longitude = longitude || userInfo.longitude;
  latitude = latitude || userInfo.latitude;
  // console.log(mediaType);
  const emergency = await Emergency.create({
    title,
    user,
    dispatcher,
    phone,
    longitude,
    latitude,
    media,
    mediaType,
  });

  if (!emergency) {
    deleteEmerMedia(req);
    return next(new ApiError("تم استلام معلومات غير صحيحة", 400));
  }
  res.status(200).json({ message: "لقد تلقينا طلبك" });
};

const getEmergencies = async (req, res, next) => {
  const emergencies = await Emergency.find();

  res.status(200).json({ data: emergencies });
};

const toggleEmergencyStatus = async (req, res, next) => {
  const emergency = await Emergency.findById(req.params.id);

  if (!emergency) {
    return next(new ApiError("No emergency with this id", 404));
  }

  await Emergency.findByIdAndUpdate(req.params.id, {
    resolved: !emergency.resolved,
  });

  res.status(200).json({ data: emergency });
};

const emergenciesInfo = async (req, res, next) => {
  const totalEmergencies = await Emergency.find({}).lean().exec();
  const resolvedEmergencies = await Emergency.find({ resolved: true })
    .lean()
    .exec();
  const users = await User.find({ role: "user" }).lean().exec();

  return res.status(200).json({
    data: {
      users: users.length,
      totalEmergencies: totalEmergencies.length,
      resolvedEmergencies: resolvedEmergencies.length,
    },
  });
};

module.exports = {
  createEmergency,
  uploadEmerMedia,
  getEmergencies,
  toggleEmergencyStatus,
  emergenciesInfo,
};
