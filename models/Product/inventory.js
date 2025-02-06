const { DataTypes, DATE } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
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
    product_variant_id: {
      type: DataTypes.STRING,
      references: {
        model: "product_variant",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
    tableName: "inventory",
  }
);
module.exports = Inventory;
