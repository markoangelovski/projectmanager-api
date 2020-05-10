const path = require("path");

// @route   GET /report
// @desc    Get locales or scans report in CSV, XLSX or JSON format
exports.getDocs = async (req, res, next) => {
  res.download(
    path.join(__dirname, "../../../../docs/PMSPA.postman_collection.json")
  );
};
