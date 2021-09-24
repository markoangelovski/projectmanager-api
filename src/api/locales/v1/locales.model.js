const mongoose = require("mongoose");
const axios = require("axios");

// GTM and Metadata parsers
const GTM = require("../../../lib/GTM");
const { getMeta } = require("../../../lib/Meta/getMeta");

// Validation
const gtmValidation = require("../../../validation/gtmAttributes");

// Type for GTM attibutes
const gtmType = {
  type: String,
  set: v => (v.length > 0 ? v : undefined)
};

const localeSchema = new mongoose.Schema(
  {
    project: String,
    title: String,
    url: {
      type: String,
      required: "URL is required.",
      unique: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
      ]
    },
    metaUrl: String,
    metaTitle: String,
    metaDescription: String,
    metaImage: String,
    favicon: String,
    scanPaused: { type: Boolean, default: false },
    scanPausedComment: gtmType,
    SiteTouchpoint: gtmType,
    GoogleAnalyticsLocal: gtmType,
    GoogleAnalyticsBrand: gtmType,
    GoogleAnalyticsReportingView: gtmType,
    SiteLocalContainer: gtmType,
    ConsentOverlayID: gtmType,
    FacebookRemarketingID: gtmType,
    Lytics: gtmType,
    Segment: gtmType,
    Dynatrace: gtmType,
    GoogleAnalyticsGA4MeasurementID: gtmType,
    globalGTM: gtmType,
    GTM: Object
  },
  { timestamps: true }
);

localeSchema.pre("save", async function (next) {
  try {
    // Set updatedAt timestamp regardless of whether the GTM was fetched and validated or not
    this.updatedAt = new Date();

    // Skips fetching and validating GTM on the locale
    if (this.skipValidation === "true") return next();

    const { data } = await axios.get(this.url);
    const meta = await getMeta(data, this.url);

    this.metaUrl = meta.url;
    this.metaTitle = meta.title;
    this.metaDescription = meta.description;
    this.metaImage = meta.image;
    this.favicon = meta.icon;
    this.globalGTM = await GTM.parseGlobal(data);
    this.GTM = GTM.parse(data);
    // Check if any of the provided attributes does not match with live attributes
    const gtmComparison = gtmValidation(this._doc);
    if (gtmComparison.hasErrors)
      return next({
        message: "A validation error occurred.",
        error: gtmComparison.result
      });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Locale", localeSchema);
