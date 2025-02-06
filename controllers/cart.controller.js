const {
  redis_get,
  redis_lrange,
  redis_set,
  redis_hset,
  redis_hgetall,
  redis_hget,
  redis_hincreby,
  redis_hdel,
  expire,
} = require("../services/redis.service");

module.exports = {
  add: async (req, res, next) => {
    try {
      const { id: productId, payload: payload } = req.body;
      const { cartId } = req.session;
      const existProduct = await redis_hget(
        `cart:${cartId}`,
        `product:${productId}`
      );
      if (!existProduct) {
        await redis_hset(`cart:${cartId}`, `product:${productId}`, payload);
        // await expire(`cart:${cartId}`, 15);
        const sl = await redis_hget(`cart:${cartId}`, `product:${productId}`);
        return res.json({
          success: true,
          msg: "Đã thêm sản phẩm vào giỏ hàng",
          soluong: sl,
        });
      }
      await redis_hincreby(`cart:${cartId}`, `product:${productId}`, payload);
      const sl = await redis_hget(`cart:${cartId}`, `product:${productId}`);
      return res.json({
        success: true,
        msg: "Đã thêm sản phẩm vào giỏ hàng",
        soluong: sl,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  deleteItem: async (req, res, next) => {
    try {
      const { cartId } = req.session;
      const { id: productId } = req.params;
      const quantityIncart =
        (await redis_hget(`cart:${cartId}`, `product:${productId}`)) || 0;
      if (quantityIncart) {
        await redis_hdel(`cart:${cartId}`, `product:${productId}`);
        return res.json({
          msg: "Đã xóa sản phẩm khỏi giỏ hàng",
          success: true,
        });
      }
      throw new Error("Không có sản phẩm trong giỏ hàng");
    } catch (error) {
      next(error);
    }
  },
};

// setRedis: async (req, res, next) => {
//   try {
//     const { key, payload } = req.body;
//     return res.json({
//       data: await setPromise({ key, value: JSON.stringify(payload) }),
//     });
//   } catch (error) {
//     next(error);
//   }
// },
