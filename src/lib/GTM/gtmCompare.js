const gtmCompare = (previousGtm, scannedGtm) => {
  // If GTM does not exist, initialize key to an empty array
  const previousGtmKeys = previousGtm ? Object.keys(previousGtm) : [];
  const scannedGtmKeys = scannedGtm ? Object.keys(scannedGtm) : [];

  const missingKeysInPrevious = [];

  // Check if any of the keys from scanned GTM are missing in the previous GTM
  for (const gtmKey of scannedGtmKeys) {
    if (previousGtmKeys.indexOf(gtmKey) === -1) {
      missingKeysInPrevious.push(gtmKey);
    }
  }

  const missingKeysInScanned = [];

  // Check if any of the keys from previous GTM are missing in the scanned GTM
  for (const gtmKey of previousGtmKeys) {
    if (scannedGtmKeys.indexOf(gtmKey) === -1) {
      missingKeysInScanned.push(gtmKey);
    }
  }

  // Comparison result container object
  const diff = {};

  // Compare previous GTM keys with scanned GTM keys and store the differences
  for (const gtmKey of previousGtmKeys) {
    // Check if the key exists in the scanned GTM and log only diffs for existing keys
    if (
      scannedGtm[gtmKey] !== undefined &&
      previousGtm[gtmKey] !== scannedGtm[gtmKey]
    ) {
      diff[gtmKey] = {};
      diff[gtmKey]["previous"] = previousGtm[gtmKey];
      diff[gtmKey]["scanned"] = scannedGtm[gtmKey];
    }
  }

  return {
    hasMissingKeys:
      missingKeysInPrevious.length > 0 || missingKeysInScanned.length > 0,
    missingKeysInPrevious,
    missingKeysInScanned,
    hasErrors: Object.keys(diff).length > 0,
    diff
  };
};

module.exports = gtmCompare;
