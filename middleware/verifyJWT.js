const jwt = require("jsonwebtoken");

const ApiError = require("../utils/apiError");
const User = require("../models/User");

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return next(new ApiError("Forbidden", 403));
  }

  const user = await User.findById(decoded.userInfo.userId);
  if (!user) {
    return next(new ApiError("Forbidden", 403));
  }

  if (user.passwordChangedAt) {
    const timeStamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    if (timeStamp > decoded.iat) {
      return next(new ApiError("Your password has been changed", 401));
    }
  }

  req.userId = decoded.userInfo.userId;
  req.role = decoded.userInfo.role;
  next();
};

const allowedTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(new ApiError("You are not allowed to use this route", 403));
    }
    next();
  };

module.exports = { verifyJWT, allowedTo };
