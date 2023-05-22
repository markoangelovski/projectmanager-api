module.exports = locale => {
  const result = {};

  const localeKeys = Object.keys(locale);

  // Check all keys stored in the Locale. Compare keys from Locale and Scanned GTM. If both keys exist, have some data to them and they are not equal, store the different keys in result object.
  localeKeys.forEach(key => {
    if (locale.GTM.hasOwnProperty(key)) {
      if (locale.GTM[key].length && locale[key] !== locale.GTM[key]) {
        result[key] = {};
        result[key].previous = locale[key];
        result[key].scanned = locale.GTM[key];
      }
    }
  });

  return {
    hasErrors: Object.keys(result).length > 0,
    result
  };
};
