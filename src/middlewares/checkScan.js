const moment = require("moment");

// Model imports
const Scan = require("../api/scans/v1/scans.model");
const Locale = require("../api/locales/v1/locales.model");

// GTM Functions
const gtmScanner = require("../../lib/GTM/gtmScanner");

const checkScan = async (req, res, next) => {
  let time = moment()
    .format("HH:mm")
    .split(":")
    .map(item => parseInt(item))
    .reduce(
      (acc, current, i, arr) =>
        current === arr[0] ? current + acc : current / 60 + acc,
      0
    );

  if (time < 18 || time > 23) {
    // If current time is less than 18:00, do nothing
    next();
  } else {
    try {
      const scanCount = await Scan.countDocuments({
        createdAt: {
          $gte: moment().startOf("day").format(),
          $lte: moment().endOf("day").format()
        }
      });

      if (scanCount) {
        // If scan has been performed, do nothing
        next();
      } else {
        // Continue the flow and perform the scan in the background
        next();

        // Generate Scan ID for fetching the scan later
        const scanID = Math.floor(10000 + Math.random() * 90000);

        // Create Scan placeholder
        const scanPlaceholder = new Scan({
          scanID
        });

        // Wait for the Scan placehoder to save in order not to run multiple scans
        const scan = await scanPlaceholder.save();

        // Get locales
        const locales = await Locale.find().select("title url favicon GTM");

        // Initiate scan
        const scanResult = await gtmScanner(locales);

        // Update Scan placehoder with results
        Scan.updateOne(
          { _id: scan._id },
          {
            $set: { ...scanResult }
          }
        ).then(scan => scan);
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  }
};

module.exports = checkScan;
