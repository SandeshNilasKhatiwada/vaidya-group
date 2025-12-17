const express = require("express");
const router = express.Router();
const {
  importCSV,
  downloadLog,
} = require("../controllers/carImport.controller");
const upload = require("../middlewares/multer.middleware");

// Import CSV
router.post("/import", upload.single("csvFile"), importCSV);

// Download log file
router.get("/logs/:filename", downloadLog);

module.exports = router;
