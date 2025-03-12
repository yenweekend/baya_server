const jwt = require("jsonwebtoken");
const asyncHanlder = require("express-async-handler");
const { User } = require("../models/association");
const throwError = require("../helpers/throwError");
module.exports = {
  verifyToken: asyncHanlder(async (req, res, next) => {
    const token = req.cookies.accessToken; // Lấy access token từ cookie
    if (!token) return res.status(401).json({ message: "Unauthorized" }); // return 401 status => call request refreshaccesstoken
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.userId = user.userId;
      next();
    });
  }),
  isAdmin: asyncHanlder(async (req, res, next) => {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Người dùng không tồn tại", 404);
    }
    if (user?.role !== "admin") {
      throwError("Bạn không có quyền truy cập", 403);
    }
    next();
  }),
};
