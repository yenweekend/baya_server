const express = require("express");
const router = express.Router();
const AttributeController = require("../controllers/attribute.controller");
router.post("/createattribute", AttributeController.createAttribute);
router.get("/createbulkattribute", AttributeController.createBulkAttribute);
router.get(
  "/createbulkattributevalue",
  AttributeController.createBulkAttributeValue
);

module.exports = router;
