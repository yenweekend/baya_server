const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const uploadCloud = require("../configs/cloudinary.config");
const { verifyToken } = require("../middleware/auth");

// router.post(
//   "/createproduct",
//   // uploadCloud.array("gallery", 8),
//   ProductController.createProduct
// );
router.post("/create-mutiple", ProductController.createProducts);
router.post("/variant/add", ProductController.addVariants);
router.post("/variant/assign", ProductController.assignVariant);
router.post("/desc/update", ProductController.updateDescription);
router.post(
  "/product-variant/image/:id",
  ProductController.addProductVariantImages
);
router.post(
  "/product-collection/create",
  ProductController.createProductFromCollection
);
router.post("/thumbnail/update", ProductController.updateProductsThumbnails);

router.get("/product-detail/:slug", ProductController.getProductDetail);
router.get("/viewed", ProductController.getViewedProducts);

router.post("/update", ProductController.updateProductCategory);
router.post(
  "/feedback",
  verifyToken,
  uploadCloud.array("images", 4),
  ProductController.handleFeedBack
);
module.exports = router;
