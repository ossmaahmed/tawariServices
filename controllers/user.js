const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");
const uploadImage = require("../middleware/uploadImage");

//  @desc   Change password
//  @route  PATCH /user/changePassword
//  @access Private
const changePassword = async (req, res, next) => {
  const { current_pass, new_pass } = req.body;
  const user = await User.findById(req.userId);

  if (!user) {
    return next(new ApiError("This account has been deleted", 404));
  }

  const match = await bcrypt.compare(current_pass, user.password);
  if (!match) {
    return next(new ApiError("Unauthorized", 401));
  }

  user.password = await bcrypt.hash(new_pass, 10);
  user.passwordChangedAt = Date.now();

  await user.save();

  const token = generateToken(user._id, user.role);
  res.status(200).json({ token });
};

const uploadProfileImage = uploadImage("profileImage");

const resizeUserImage = async (req, res, next) => {
  if (!fs.existsSync(path.join(__dirname, "..", "uploads"))) {
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads"));
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads", "users"));
  }
  if (!fs.existsSync(path.join(__dirname, "..", "uploads", "users"))) {
    await fsPromises.mkdir(path.join(__dirname, "..", "uploads", "users"));
  }

  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(400, 400)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileName}`);

    req.body.profileImage = fileName;
  }

  next();
};

const deleteProfileImage = (req) => {
  if (req.body.profileImage) {
    fs.rmSync(
      path.join(__dirname, "..", "uploads", "users", req.body.profileImage)
    );
  }
};

//  @desc   Change user info
//  @route  PUT /user
//  @access Private
const changeUserInfo = async (req, res, next) => {
  const { name, phone, nationalID, profileImage, longitude, latitude } =
    req.body;

  if (nationalID && nationalID.length !== 14) {
    deleteProfileImage(req);
    return next(new ApiError("Wrong national id format", 400));
  }

  const dublicated = await User.findOne({ phone })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (dublicated && dublicated._id.toString() !== req.userId.toString()) {
    deleteProfileImage(req);
    return next(new ApiError("Dublicated user phone", 409));
  }

  const user = await User.findById(req.userId);

  if (!user) {
    deleteProfileImage(req);
    return next(new ApiError("Invalid user data received", 400));
  }

  if (req.body.profileImage) {
    fs.rmSync(
      path.join(__dirname, "..", "uploads", "users", user.profileImage)
    );
  }

  await User.findByIdAndUpdate(
    req.userId,
    {
      name,
      phone,
      nationalID,
      profileImage,
      longitude,
      latitude,
    },
    { new: true }
  );
  res.status(200).json({ message: "profile updated successfully" });
};

//  @desc   Get user info
//  @route  GET /user
//  @access Private
const getUserInfo = async (req, res, next) => {
  const user = await User.findById(req.userId)
    .select("-_id -password -createdAt -updatedAt -__v")
    .lean()
    .exec();

  if (!user) {
    return next(new ApiError("No users found", 404));
  }

  if (user.profileImage) {
    user.profileImage = `${process.env.BASE_URL}/users/${user.profileImage}`;
  }
  res.status(200).json(user);
};

const getUsers = async (req, res, next) => {
  let users = await User.find({});
  users = users.filter((user) => user._id.toString() !== req.userId.toString());

  res.status(200).json({ data: users });
};

module.exports = {
  changePassword,
  uploadProfileImage,
  resizeUserImage,
  changeUserInfo,
  getUserInfo,
  getUsers,
};
