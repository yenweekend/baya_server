const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
router.get("/getprovince", OrderController.getProvince);
router.post("/address", OrderController.postAddress);
router.post("/", OrderController.order);

module.exports = router;
