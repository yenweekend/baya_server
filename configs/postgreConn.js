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
// const sequelize = new Sequelize("baya-server", "postgres", "250204", {
//   host: "127.0.0.1", // Change this if your database is hosted elsewhere
//   dialect: "postgres",
//   logging: false, // Disable SQL logging in console (optional)
// });
const dbConn = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { sequelize, dbConn };
