const UserModel = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");

const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token);
  if (!token) {
    return next(
      new ErrorHandler(
        "Login first to access this resource,no token found",
        401
      )
    );
  }

  const decodedData = jwt.verify(token, "AshwinIsAwesome");
  req.user = await UserModel.findById(decodedData.id);

  next();
});

module.exports = isAuthenticatedUser;
