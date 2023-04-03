const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const UserModel = require("../models/userModel");

const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");

// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await UserModel.create({
    name,
    email,
    password,
    avatar: {
      public_id: "default id",
      url: "profile pic",
    },
  });
  // save token in cookie and send response
  sendToken(user, 200, res);
});

// Login user => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // finding user in database + password is for select password as it is not selected by default
  const user = await UserModel.findOne({ email: email })
    .select("+password")
    .exec();
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  // save token in cookie and send response
  sendToken(user, 200, res);
});

// Logout user => /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  // clear cookie
  res.cookie("token", null, {
    // expire the cookie in 1 sec
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Forgot password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // find user
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }
  // Get ResetPassword token
  const resetToken = user.getResetPasswordToken();
  // save user
  await user.save({ validateBeforeSave: false });
  // create reset password url

  const resetPasswordUrl = `{req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  // prepare message
  const message = `Your password reset token is as follow:\n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopSphere Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    // as we had saved the user earlier so we need to remove the token and expire time
    return next(new ErrorHandler(error.message, 500));
  }
});

//
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // find the user with the token
  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or has expired", 400)
    );
  }

  // set new password
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  // setup new password
  user.password = req.body.password;

  // remove resetPasswordToken and resetPasswordExpire
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
