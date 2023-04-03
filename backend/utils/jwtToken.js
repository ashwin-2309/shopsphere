// Create token and save in cookie

const sendToken = (user, statusCode, res) => {
  // Create jwt token
  const token = user.getJwtToken();

  // Options for cookie
  const options = {
    // process.env.JWT_COOKIE_EXPIRE is in seconds
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
