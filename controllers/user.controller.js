const { User } = require("../models/association");
const { sequelize } = require("../configs/postgreConn");
const { where } = require("sequelize");
const asyncHanlder = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../configs/sendEmail");
const { Op } = require("@sequelize/core");
module.exports = {
  signUp: asyncHanlder(async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const alreadyAccount = await User.findOne({ where: { email: email } });
      if (alreadyAccount)
        throw new Error(`Email ${email} đã được người khác sử dụng`);
      const newUser = await User.create({
        name,
        email,
        password,
      });
      if (!newUser) throw new Error("Tạo người dùng thất bại");
      return res.json({
        success: true,
        message: "success",
        data: { name, email, password },
      });
    } catch (error) {
      throw new Error(error);
    }
  }),
  login: asyncHanlder(async (req, res) => {
    const { email, password } = req.body;
    // find exist email
    const response = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!response || !response.isCorrectPassword(password))
      throw new Error(`Mật khẩu hoặc email sai xin vui lòng kiểm tra lại`);
    try {
      const { password, role, refreshToken, ...userData } = response.toJSON();
      const accessToken = jwt.sign(
        { userId: userData.id, role: role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "3d" }
      );
      const newRefreshToken = jwt.sign(
        { userId: userData.id },
        process.env.ACCESS_TOKEN_SECRET,
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
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        userData: userData, // Only non-sensitive fields
        success: true,
        message: "Welcome to BeautyBox",
        accessToken,
      });
    } catch (error) {
      throw new Error(error);
    }
  }),
  verify: asyncHanlder(async (req, res) => {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password", "role", "refreshToken"] },
    });
    if (!user) throw new Error("Khong tim thay nguoi dung");
    return res.json({
      success: true,
      user,
    });
  }),
  renewAccessToken: asyncHanlder(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) {
      throw new Error("Khong tim thay refresh token in cookies");
    }
    const result = await jwt.verify(
      cookie.refreshToken,
      process.env.ACCESS_TOKEN_SECRET
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
          expiresIn: "3d",
        }
      );
      return res.status(200).json({
        success: true,
        message: "Tao moi access token thanh cong !",
        newAccessToken: newAccessToken,
      });
    }
    throw new Error("Refresh Token khong khop Vui long kiem tra lai !");
  }),
  logout: asyncHanlder(async (req, res) => {
    console.log(req.cookies);
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) {
      throw new Error("Khong tim thay refresh token trong cookies");
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
    return res.json({
      success: true,
      message: "log out is done !",
    });
  }),
  forgotPassword: asyncHanlder(async (req, res) => {
    const { email } = req.query;
    console.log(email);
    if (!email) throw new Error("Khong tim thay email");
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    console.log(user);
    if (!user) throw new Error("nguoi dung khong ton tai");
    const resetToken = await user.createTokenPasswordAlter(); // token này chưa được hash
    await user.save();
    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_CLIENT}/auth/resetpassword/${resetToken}>Click here</a>`;
    const data = {
      email,
      html,
    };
    console.log("come");
    const result = await sendMail(data);
    console.log("next");
    return res.status(200).json({
      success: true,
      result,
    });
  }),
  resetPassword: asyncHanlder(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error("Missing imputs");
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
    if (!user) throw new Error("Giá trị token không hợp lệ");
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpireds = null;
    user.passwordChangeAt = Date.now();
    await user.save();
  }),
  getCurrentUser: asyncHanlder(async (req, res) => {
    const userId = req.userId;
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: { exclude: ["refreshToken", "password", "role"] },
    });
    return res.status(200).json({
      success: user ? true : false,
      data: user,
    });
  }),
};
