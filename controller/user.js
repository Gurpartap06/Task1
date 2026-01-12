const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");


const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    const accessToken = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
          { email: user.email, userId: user._id },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "1m" }
        );

        const newRefreshToken = jwt.sign(
          { email: user.email, userId: user._id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: "7d" }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, refreshToken };
