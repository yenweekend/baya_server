const {
  Order,
  OrderDetail,
  User,
  Product,
  Coupon,
  Address,
} = require("../models/association");
const asyncHandler = require("express-async-handler");
const { hexists, hdel } = require("../services/redis.service");
const { sequelize } = require("../configs/postgreConn");
const throwError = require("../helpers/throwError");
const { Op, where } = require("sequelize");

module.exports = {
  create: asyncHandler(async (req, res) => {
    const { address, items, coupon_id, address_code, total_price } =
      req.body.data;
    // const { userId } = req;
    const userId = "WBo50izPh";
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throwError("Không tìm thấy tài khoản người dùng", 404);
      }
      const newOrder = await user.createOrder(
        {
          coupon_id: coupon_id,
          address: address,
          address_code,
          total_price: total_price,
        },
        { transaction }
      );
      await Promise.all(
        items.map(async (item) => {
          const product = await Product.findByPk(item.id, { transaction });

          if (!product) {
            throw new Error(`Product with ID ${item.id} does not exist.`);
          }
          await newOrder.addProduct(product, {
            through: {
              quantity: item.quantity,
              price: product.price || product.price_original,
              price_original: product.price_original,
            },
            transaction,
          });
          await hdel(`cart:${userId}`, `product:${item.id}`);
        })
      );
      await transaction.commit();
      return res.status(201).json({
        msg: "Đã tạo đơn hàng thành công",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }),
  updateStatus: asyncHandler(async (req, res) => {
    const { status, orderId } = req.body.data;
    await Order.update(
      {
        status: status,
      },
      { where: { id: orderId } }
    );
    return res.status(201).json({
      msg: "Đã cập nhật trạng thái đơn hàng",
    });
  }),
  get: asyncHandler(async (req, res) => {
    // const { userId } = req;
    const userId = "WBo50izPh";
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Không tìm thấy người dùng", 404);
    }

    const orderDetail = await user.getOrders({
      include: [
        {
          model: OrderDetail,
          include: {
            model: Product,
          },
        },
        {
          model: Coupon,
        },
      ],
    });

    return res.status(200).json({
      msg: "Lấy dữ liệu đơn mua thành công",
      data: orderDetail,
    });
  }),
  getPurchaseUserInfo: asyncHandler(async (req, res) => {
    // const userId = req.userId;
    const userId = "WBo50izPh";

    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: { exclude: ["refreshToken", "password", "role"] },
    });
    const addresses = await user.getAddresses({
      where: {
        on_used: true,
      },
    });
    return res.status(200).json({
      userInfo: user,
      addresses,
    });
  }),
};
