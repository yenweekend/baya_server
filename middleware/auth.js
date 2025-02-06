// const validate = (schema) => (req, res, next) => {
//   {
//     const { error, value } = schema.validate(req.body);
//     if (error) {
//       return res.json({
//         success: false,
//         message: error,
//         value: value,
//       });
//     }
//     next();
//   }
// };
// module.exports = {
//   validate,
// };
const jwt = require("jsonwebtoken");
const asyncHanlder = require("express-async-handler");
const { User } = require("../models/association");
module.exports = {
  verifyToken: asyncHanlder(async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Không tìm thấy Token");
    }
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  }),
  isAdmin: asyncHanlder(async (req, res, next) => {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Khong tim thay nguoi dung");
    }
    if (user?.role != "admin") {
      throw new Error("Ban Khong phai Admin");
    }
    next();
  }),
};
