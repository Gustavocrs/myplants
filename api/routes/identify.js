const express = require("express");
const multer = require("multer");
const identifyController = require("../controllers/identifyController");

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

router.post("/", upload.single("image"), identifyController.identifyPlant);

module.exports = router;
