const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    scanID: String,
    localesScanned: Number,
    totalMissingKeys: Number,
    totalErrors: Number,
    scanDurationMs: Number,
    stats: Array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);
