const ctrls = require("../controllers/user.controller");
const { signupSchema } = require("../middleware/joiSchema");
const { verifyToken, isAdmin } = require("../middleware/auth");
const express = require("express");
const router = express.Router();
// router.post("/signup", validate(signupSchema));
router.post("/register", ctrls.signUp);
router.post("/login", ctrls.login);
router.post("/refreshtoken", ctrls.renewAccessToken);
router.get("/currentuser", verifyToken, ctrls.getCurrentUser);

router.get("/logout", ctrls.logout);
router.get("/forgotpassword", ctrls.forgotPassword);
router.put("/resetpassword", ctrls.resetPassword);

module.exports = router;
