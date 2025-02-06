const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const uploadCloud = require("../configs/cloudinary.config");

// router.post(
//   "/createproduct",
//   // uploadCloud.array("gallery", 8),
//   ProductController.createProduct
// );
router.post("/create-mutiple", ProductController.createProducts);
router.post("/desc/update", ProductController.updateDescription);
router.get("/product-detail/:slug", ProductController.getProductDetail);

router.post("/update", ProductController.updateProductCategory);
module.exports = router;
