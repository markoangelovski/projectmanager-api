const mongoose = require("mongoose");
const axios = require("axios");

// GTM and Metadata parsers
const gtmParser = require("../lib/GTM/gtmParser");
const { getMeta } = require("../lib/Meta/getMeta");

// Validation
const gtmValidation = require("../validation/gtmAttributes");

const localeSchema = new mongoose.Schema(
  {
    project: String,
    title: String,
    url: {
      type: String,
      required: "URL is required.",
      unique: true
    },
    metaUrl: String,
    metaTitle: String,
    metaDescription: String,
    metaImage: String,
    favicon: String,
    SiteTouchpoint: String,
    GoogleAnalyticsLocal: String,
    GoogleAnalyticsBrand: String,
    GoogleAnalyticsReportingView: String,
    GoogleAnalyticsConsentRequired: String,
    SiteLocalContainer: String,
    ConsentOverlay: String,
    ConsentOverlayID: String,
    SitePrivacyProtection: String,
    SiteGDPR: String,
    FacebookRemarketingID: String,
    GTM: Object
  },
  { timestamps: true }
);

localeSchema.pre(["save", "updateOne"], async function(next) {
  try {
    const { data } = await axios.get(this.url);
    const meta = await getMeta(data, this.url);

    this.metaUrl = meta.url;
    this.metaTitle = meta.title;
    this.metaDescription = meta.description;
    this.metaImage = meta.image && meta.image;
    this.favicon = meta.icon;
    this.GTM = gtmParser(data);

    // Check if any of the provided attributes does not match with live attributes
    const err = gtmValidation(this);
    if (err) throw new Error(err);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Locale", localeSchema);
