const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  timezone: "+07:00",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    charset: "utf8",
    useUTC: false, // cho múi giờ nếu cần
    dateStrings: true, // cho định dạng ngày nếu cần
  },
  logging: false,
  define: {
    charset: "utf8",
    collate: "utf8_general_ci",
  },
});
const dbConn = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { sequelize, dbConn };
