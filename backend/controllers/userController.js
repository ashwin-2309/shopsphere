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

// Get User Detail -- /api/v1/me -- private
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  // we have already added the user in req.user in auth middleware
  const user = await UserModel.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Password -- /api/v1/password/update -- private
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select("+password");
  // check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// Update User Profile -- /api/v1/me/update -- private
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // Update avatar
  // ? add cloudinary later

  const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  sendToken(user, 200, res);
});

// admin routes

// Get all users -- /api/v1/admin/users -- private
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await UserModel.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user details by admin -- /api/v1/admin/user/:id -- private
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user role by admin -- /api/v1/admin/user/:id -- private -- admin
// ! this route test is not working showing duplicate email error but why
// @ it was not working because i was using req.user.id instead of req.params.id😂😂
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  console.log(newUserData);

  const user = await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User role updated successfully 😉😉",
  });
});

// Delete user by admin -- /api/v1/admin/user/:id -- private -- admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);
  // We will remove cloidinary image later

  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`));
  }
  // .remove is deprecated 😁😁
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User deleted successfully😉😉",
  });
});
