const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
  const {
    fullName: { firstName, lastName },
    email,
    password,
  } = req.body;

  const existingUser = await userModel.findOne({
    email,
  });

  if (existingUser) {
    return res.status(400).json({
      Message: "User already registered",
    });
  }

  const hashedPassword = await bcrypt.hashSync(password, 10);
  try {
    const user = await userModel.create({
      fullName: {
        firstName,
        lastName,
      },
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(201).json({
      message: "User Created Successfully",
      email,
      fullName: user.fullName,
      token,
    });
  } catch (error) {
    console.error(error);
  }
}
async function loginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token);

  res.status(200).json({
    message: "User Logged in  Successfully",
    user: {
      email,
      fullName: user.fullName,
    },
  });
}

async function logoutController(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Logout failed" });
  }
}

module.exports = {
  loginController,
  registerController,
  logoutController,
};
