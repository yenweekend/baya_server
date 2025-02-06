const { Attribute, AttributeValue } = require("../models/association");
class AttributeController {
  async createAttribute(req, res) {
    try {
      const { name } = req.body;
      const newAttr = await Attribute.create({ name });
      if (newAttr) {
        return res.json({
          success: true,
          message: "add brand successfully",
          data: newAttr,
        });
      }
      return res.json({
        success: false,
        message: `add attribute failed `,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: `add attribute failed ${error}`,
      });
    }
  }

  async createBulkAttribute(req, res) {
    try {
      const rs = await Attribute.bulkCreate([
        {
          name: "Dung tích",
        },
        {
          name: "Màu",
        },
        {
          name: "Mùi hương",
        },
        {
          name: "Hạn sử dụng",
        },
      ]);
      if (rs) {
        return res.json({
          success: true,
          message: "add brand successfully",
          data: rs,
        });
      }
      return res.json({
        success: false,
        message: `add attribute failed `,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: `add attribute failed ${error}`,
      });
    }
  }
  async createBulkAttributeValue(req, res) {
    try {
      const rs = await AttributeValue.bulkCreate([
        {
          attr_id: "3",
          title: "BE01 Milky Cinnamon",
          value: "#dd6c57",
        },
        {
          attr_id: "3",
          title: "RD01 Rosy Shell",
          value: "#b7302d",
        },
        {
          attr_id: "3",
          title: "PK01 Nudy Near",
          value: "#e1685c",
        },
        {
          attr_id: "3",
          title: "RD02 Deep Hazy",
          value: "#94241a",
        },
      ]);
      if (rs) {
        return res.json({
          success: true,
          message: "add attribute value successfully",
          data: rs,
        });
      }
      return res.json({
        success: false,
        message: `add attribute failed `,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: `add attribute failed ${error}`,
      });
    }
  }
}
module.exports = new AttributeController();
