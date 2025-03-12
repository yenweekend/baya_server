const { Attribute, AttributeValue } = require("../models/association");
const asyncHandler = require("express-async-handler");
module.exports = {
  createAttribute: asyncHandler(async (req, res) => {
    const { name } = req.body;
    const newAttr = await Attribute.create({ name });
    if (newAttr) {
      return res.json({
        success: true,
        message: "add attribute successfully",
        data: newAttr,
      });
    }
    return res.json({
      success: false,
      message: `add attribute failed `,
    });
  }),
  createBulkAttribute: asyncHandler(async (req, res) => {
    const attributes = req.body.attributes;
    const rs = await Attribute.bulkCreate(attributes);
    if (rs) {
      return res.json({
        success: true,
        message: "add attrs successfully",
      });
    }
  }),
  addAttributeValue: asyncHandler(async (req, res) => {
    const data = req.body.data;
    const attribute = await Attribute.findOne({
      where: {
        name: data.attribute,
      },
    });
    if (!attribute) {
      res.status(404).json({
        message: "Không tìm thấy attribute",
      });
    }
    await attribute.createAttributeValue({ value: data.value });
    res.status(201).json({
      message: "Thêm giá trị cho attr thành công",
    });
  }),
};
