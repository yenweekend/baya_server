const { Province, District, Ward } = require("../models");
const {
  redis_get,
  redis_set,
  redis_setnx,
  redis_exists,
  redis_increby,
} = require("../services/redis.service");
class OrderController {
  async getProvince(req, res) {
    try {
      const province = await Province.findAll();
      const vl = province?.map((item) => {
        return {
          value: item.id,
          label: item.name,
          id: 1,
        };
      });
      if (province) {
        return res.json({
          success: true,
          data: vl,
        });
      }
      return res.json({
        success: false,
      });
    } catch (error) {}
  }
  async postAddress(req, res) {
    try {
      const { id, value } = req.body;
      if (id == 1) {
        const district = await District.findAll({
          where: { province_id: value },
        });
        if (district) {
          const data = district?.map((item) => {
            return {
              value: item.id,
              label: item.name,
              id: 2,
            };
          });
          return res.json({
            success: true,
            data: data,
            type: 2,
          });
        }
      } else if (id == 2) {
        const ward = await Ward.findAll({ where: { district_id: value } });
        if (ward) {
          const data = ward?.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          });
          return res.json({
            success: true,
            data: data,
          });
        }
      }
      return res.json({
        success: false,
        message: "Failed get address",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Failed get address",
      });
    }
  }
  async order(req, res, next) {
    try {
      const sltonkho = 10;
      const keyName = "iphone16";
      const { slMua } = req.body;
      const getKey = await redis_exists(keyName);
      if (!getKey) {
        await redis_set(keyName, 0);
      }
      let slBanRa = await redis_get(keyName);
      console.log(
        "Truoc khi user order thanh cong thi so luong ban ra :",
        slBanRa
      );
      slBanRa = await redis_increby(keyName, slMua);
      if (slBanRa > sltonkho) {
        console.log("Out of Stock !");
        return res.json({
          status: "fail",
          msg: "out of stock",
        });
      }
      console.log(
        "Sau khi user order thanh cong thi so luong ban ra :",
        slBanRa
      );
      return res.json({
        status: "success",
        msg: "OK",
      });
      // gia su moi lan khach hang order thanh cong thi so luong giam di 1
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
