const express = require("express");
const { add, deleteItem } = require("../controllers/cart.controller");
const { checkSession } = require("../middleware/checkSession");
const router = express.Router();

router.post("/add", [checkSession], add);
router.post("/delete/:id", [checkSession], deleteItem);
module.exports = router;
