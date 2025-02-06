const auth = require("./auth.route");
const productRouter = require("./product.route");
const categoryRouter = require("./category.route");
const attributeRouter = require("./attribute.route");
const orderRouter = require("./order.route");
const cartRouter = require("./cart.route");
const vendorRouter = require("./vendor.route");
const blogRouter = require("./blog.route");
const collectionRouter = require("./collection.route");
const express = require("express");

const router = express.Router();

router.use("/v1/auth", auth); // Route cho auth
router.use("/products", productRouter); // Route cho products
router.use("/categories", categoryRouter); // Route cho categories
router.use("/attributes", attributeRouter); // Route cho attributes
router.use("/orders", orderRouter);
router.use("/carts", cartRouter);
router.use("/vendors", vendorRouter);
router.use("/blogs", blogRouter);
router.use("/collections", collectionRouter);

module.exports = router;
