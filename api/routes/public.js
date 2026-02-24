const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");

router.get("/:slug", publicController.getPublicProfile);

module.exports = router;
