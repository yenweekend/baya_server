require("dotenv").config();
const PORT = process.env.PORT || 3001;
const { sequelize } = require("./configs/postgreConn");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { dbConn } = require("./configs/postgreConn");

const app = express();
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.URL_CLIENT
    : "http://localhost:5173";
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const client = require("./databases/init.redis");
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new RedisStore({ client: client, ttl: 3600 }),
    secret: process.env.REDIS_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 3600 * 1, // cookie last for 3 hours
    },
  })
);

dbConn();

sequelize.sync();
const routes = require("./routes");

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Server Baya On");
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error); // chuyển lỗi đến xử lí lỗi
});

// error handler middleware
app.use((error, req, res, next) => {
  console.log("error: - ", error);
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      msg: error.message || "Internal Server Error",
    },
  });
});

const server = app.listen(PORT, () => {
  console.log(`Start server listen at http://localhost:${PORT}`);
});
process.on("SIGINT", () => {
  server.close(() => console.log(`exits server express`));
});
