const express = require("express");
const { getPlays} = require("../controllers/play");

const router = express.Router();

router.get("/list", getPlays);

module.exports = router