const moment = require("moment");

// Model imports
const Scan = require("../../api/scans/v1/scans.model");
const Locale = require("../../api/locales/v1/locales.model");

// GTM Functions
const GTM = require("../../lib/GTM");

const checkScan = async (req, res, next) => {
  let time = new Date().getHours();

  if (time < 16 || time > 22) {
    // If current time is less than 18:00 (16:00 UTC), do nothing
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
        const locales = await Locale.find().select(
          "title url favicon scanPaused GTM"
        );

        // Initiate scan
        const scanResult = await GTM.scan(locales);

        // Update Scan placehoder with results
        Scan.updateOne(
          { _id: scan._id },
          {
            $set: { ...scanResult }
          }
        ).then(scan => console.log("New Scan created"));
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  }
};

module.exports = checkScan;
