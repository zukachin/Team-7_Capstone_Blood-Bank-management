const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
router.get("/",(req,res)=>
{
    res.send("hi");
})
router.post("/register", authCtrl.register);
router.post("/verify-otp", authCtrl.verifyOtp);
router.post("/login", authCtrl.login);
router.post("/resend-otp", authCtrl.resendOtp);


module.exports = router;
