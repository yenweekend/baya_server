const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.STRING,
      references: {
        model: "product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    sku: {
      type: DataTypes.STRING,
    },
    price_original: {
      type: DataTypes.DECIMAL(10, 2),
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "product_variant",
    timestamps: true,
  }
);
ProductVariant.beforeCreate(async (pv, options) => {
  const sku = shortid.generate();
  pv.sku = sku;
});
ProductVariant.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const sku = shortid.generate();
    ins.sku = sku;
  }
});
module.exports = ProductVariant;
