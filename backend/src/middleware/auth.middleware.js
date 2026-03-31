const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");

async function authUser(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorised",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Does not fetch password
    // const user = await userModel.findById(decoded.id).select("-password")
    const user = await userModel.findById(decoded.id);

    req.user = user;

    next();

    console.log(user)
  } catch (error) {
    res.status(401).json({
      message: "Unauthorised",
    });
  }
}

module.exports = {authUser};
