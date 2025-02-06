const express = require("express");
const router = express.Router();
const CollectionController = require("../controllers/collection.controller");

router.post("/create", CollectionController.createCollections);

module.exports = router;
