const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    scanID: String,
    localesTotal: Number,
    localesScanned: Number,
    totalMissingKeys: Number,
    totalErrors: Number,
    totalGtmParserErrors: Number,
    totalFetchLocaleErrors: Number,
    scanDurationMs: Number,
    stats: Array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);
