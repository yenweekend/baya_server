const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category.controller");

router.get("/category-detail/:slug", CategoryController.getCategoryDetail);

module.exports = router;
