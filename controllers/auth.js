const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");

//  @desc   Create new user account
//  @route  POST /auth/signup
//  @access Public
exports.signup = async (req, res, next) => {
  const { name, password, phone, nationalID, longitude, latitude } = req.body;

  //  Data Confirmation
  if (
    !name ||
    !password ||
    !phone ||
    !nationalID ||
    nationalID?.length !== 14
  ) {
    return next(new ApiError("عذراً يوجد خطآ ما في احد الحقول.", 400));
  }

  //  Dublicate Checking
  const dublicate = await User.findOne({
    $or: [{ phone }, { nationalID }],
  })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (dublicate) {
    return next(new ApiError("هذه البيانات موجوده بالفعل.", 409));
  }

  //  Password Hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  //  Create and store new user
  const userObj = {
    name,
    password: hashedPassword,
    phone,
    nationalID,
    longitude,
    latitude,
  };
  const user = await User.create(userObj);

  if (user) {
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      message: `تم انشاء مستخدم حديد بإسم: ${name.split(" ")[0]}`,
      token,
    });
  } else {
    return next(new ApiError("تم استقبال بيانات غير صحيحه.", 400));
  }
};

//  @desc   Login
//  @route  POST  /auth/login
//  @access Public
exports.login = async (req, res, next) => {
  const { phone, password, longitude, latitude } = req.body;

  //  Data Confirmation
  if (!phone || !password) {
    return next(new ApiError("عذراً كل الحقول مطلوبه.", 400));
  }

  const foundUser = await User.findOne({ phone }).exec();
  if (!foundUser) {
    return next(new ApiError("رقم الهاتف او كلمة المرور غير صحيحه.", 401));
  }

  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    return next(new ApiError("رقم الهاتف او كلمة المرور غير صحيحه.", 401));
  }

  if (longitude && latitude) {
    foundUser.longitude = longitude;
    foundUser.latitude = latitude;
    await foundUser.save();
  }

  const token = generateToken(foundUser._id, foundUser.role);

  res.status(200).json({
    message: `${foundUser.name.split(" ")[0]}: ٫ تم تسجيل الدخول بنجاح.`,
    token,
  });
};
