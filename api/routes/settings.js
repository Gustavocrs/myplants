const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/:userId", settingsController.getSettings);
router.post("/:userId", settingsController.updateSettings);
router.post("/:userId/test", settingsController.testNotification);

module.exports = router;
