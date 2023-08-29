const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  //options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res
    .status(statusCode)
    .cookie("access_token", token, options)
    .send({ success: true, user, access_token:token });
};

module.exports = sendToken;
