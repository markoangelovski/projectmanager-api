const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    agaId: {
      type: String,
      required: true,
      match: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    },
    data: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analyitcs", analyticsSchema);
