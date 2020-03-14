const mongoose = require("mongoose");
const axios = require("axios");

// GTM and Metadata parsers
const gtmParser = require("../lib/GTM/gtmParser");
const { getMeta } = require("../lib/Meta/getMeta");

// Validation
const gtmValidation = require("../validation/gtmAttributes");

const localeSchema = new mongoose.Schema({
  project: String,
  title: String,
  url: {
    type: String,
    required: "URL is required.",
    unique: true
  },
  metaTitle: String,
  metaDescription: String,
  favicon: String,
  SiteTouchpoint: String,
  GoogleAnalyticsLocal: String,
  GoogleAnalyticsReportingView: String,
  SiteLocalContainer: String,
  ConsentOverlayID: String,
  FacebookRemarketingID: String,
  GTM: Object
});

localeSchema.pre("save", async function(next) {
  try {
    const { data } = await axios.get(this.url);
    const meta = await getMeta(data, this.url);

    this.metaTitle = meta.title;
    this.metaDescription = meta.description;
    this.favicon = meta.icon;
    this.GTM = await gtmParser(data);

    // Check if any of the provided attributes does not match with live attributes
    const err = gtmValidation(this);
    if (err) throw new Error(err);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Locale", localeSchema);
