const { User, Address } = require("../models/association");
const { sequelize } = require("../configs/postgreConn");
const asyncHanlder = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../configs/sendEmail");
const { Op } = require("@sequelize/core");
const throwError = require("../helpers/throwError");
module.exports = {
  signUp: asyncHanlder(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const alreadyAccount = await User.findOne({ where: { email: email } });
    if (alreadyAccount) {
      throwError(`Email ${email} đã được người khác sử dụng`, 409);
    }
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    if (!newUser) {
      throwError(`Tạo tài khoản thất bại`, 400);
    }
    return res.status(201).json({
      msg: "Tạo tài khoản thành công",
    });
  }),
  login: asyncHanlder(async (req, res) => {
    const { email, password } = req.body;
    // find exist email
    const response = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!response || !response.isCorrectPassword(password)) {
      const error = new Error(
        `Mật khẩu hoặc email sai xin vui lòng kiểm tra lại`
      );
      error.status = 409;
      throw error;
    }
    try {
      const { password, role, refreshToken, ...userData } = response.toJSON();
      const accessToken = jwt.sign(
        { userId: userData.id, role: role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: userData.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        }
      );
      await User.update(
        {
          refreshToken: newRefreshToken,
        },
        {
          where: {
            id: response.id,
          },
        }
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 1000, // 1 minutes,
        sameSite: "strict", // optionally helps prevent CSRF
        secure: process.env.NODE_ENV === "production",
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
        sameSite: "strict", // optionally helps prevent CSRF
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(200).json({
        account: userData, // Only non-sensitive fields
        msg: "Welcome to Baya",
      });
    } catch (error) {
      throw new Error(error);
    }
  }),
  logout: asyncHanlder(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) {
      throw new Error("RefreshToken not found");
    }
    await User.update(
      {
        refreshToken: "",
      },
      {
        where: {
          refreshToken: cookie.refreshToken,
        },
      }
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    });
    return res.status(201).json({
      msg: "You have been logged out!",
    });
  }),

  refreshAccessToken: asyncHanlder(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken) {
      return res.status(404).json({
        msg: "Phiên đã hết hạn hãy đăng nhập lại",
      });
    }
    const result = jwt.verify(
      cookie.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const response = await User.findOne({
      where: {
        id: result.userId,
        refreshToken: cookie.refreshToken,
      },
    });
    if (response) {
      const newAccessToken = jwt.sign(
        {
          userId: response.id,
          role: response.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1m",
        }
      );
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 1000, // 1 minutes,
        sameSite: "strict", // optionally helps prevent CSRF
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(200).json({
        msg: "Tao moi access token thanh cong !",
      });
    }
    return res.status(404).json({
      msg: "Không tìm thấy người dùng",
    });
  }),
  forgotPassword: asyncHanlder(async (req, res) => {
    const { email } = req.query;
    if (!email) throw new Error("Hãy điền email");
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) throw new Error("Người dùng không tồn tại");
    const resetToken = await user.createTokenPasswordAlter(); // token này chưa được hash
    await user.save();
    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_CLIENT}/auth/resetpassword/${resetToken}>Click here</a>`;
    const data = {
      email,
      html,
    };
    const result = await sendMail(data);
    return res.status(201).json({
      success: true,
      result,
    });
  }),
  resetPassword: asyncHanlder(async (req, res) => {
    const token = req.body.params;
    const { password } = req.body.data;
    if (!password) throw new Error("Missing imputs");
    if (!token) {
    }
    // Hash token that client send to server
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    // Check is there token exist in server
    const user = await User.findOne({
      where: {
        passwordResetToken: passwordResetToken,
        passwordResetExpired: {
          [Op.gt]: Date.now(),
        },
      },
    });
    // if the token are not exist
    if (!user) throw new Error("Đã hết thời gian yêu cầu!");
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpireds = null;
    user.passwordChangeAt = Date.now();
    await user.save();
    return res.status(201).json({
      msg: "Thay đổi mật khẩu thành công",
    });
  }),
  getAccount: asyncHanlder(async (req, res) => {
    const userId = req.userId;
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: { exclude: ["refreshToken", "password", "role", "id"] },
    });
    return res.status(200).json({
      account: user,
    });
  }),

  checkAuth: asyncHanlder(async (req, res) => {
    let userId = null;
    const token = req.cookies.accessToken;
    if (!token) {
      // access token is null
      if (req.cookies.refreshToken) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
        });
      }
      return res.status(200).json({
        account: null,
        msg: "Failed to authenticate",
      });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      // access token is made up or expired
      if (err) {
        if (req.cookies.refreshToken) {
          res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
          });
        }
        return res.status(403).json({
          account: null,
          msg: "Forbidden",
        });
      }
      userId = user.userId;
    });
    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: ["firstName", "lastName"],
    });
    if (user) {
      return res.status(200).json({
        account: user,
      });
    }
    return res.status(200).json({
      account: null,
      msg: "Failed to authencicate",
    });
  }),
  verify: asyncHanlder(async (req, res) => {
    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ["firstName", "lastName"],
    });
    if (!user) throwError("Account not found!", 404);
    return res.status(200).json({
      account: user,
    });
  }),
};
