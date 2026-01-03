const express = require("express");
const { signInWithGoogle, refreshToken } = require("../controllers/auth");

const router = express.Router();

router.post("/login", signInWithGoogle);
router.post("/refresh-token", refreshToken);

module.exports = router;
