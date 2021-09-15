const axios = require("axios");

// GTM Functions
const { gtmParser } = require("./gtmParser");
const { gtmCompare } = require("./gtmCompare");

const gtmScanner = async locales => {
  const scanPromises = [];
  let localesScanned = 0;
  const scanStart = new Date();

  // Create a new promise for each new scan
  locales.forEach(locale => {
    const { title, url, favicon, GTM: previousGtm } = locale;

    let result = {
      hasMissingKeys: false,
      missingKeysInPrevious: [],
      missingKeysInScanned: [],
      hasErrors: false,
      diff: {},
      isAxiosError: false,
      message: "",
      config: {},
      request: {},
      response: {},
      isGtmParserError: false
    };

    // Initiates a locale scan if locale is not paused.
    if (!locale.scanPaused) {
      scanPromises.push(
        new Promise(resolve => {
          axios
            .get(url)
            .then(({ data }) => {
              try {
                const scannedGtm = gtmParser(data);
                result = gtmCompare(previousGtm, scannedGtm);
              } catch (err) {
                result = {
                  ...result,
                  isGtmParserError: true,
                  message: err.message,
                  ...err
                };
              }
              resolve({
                title,
                url,
                favicon,
                result
              });
            })
            .catch(err => {
              // TODO: Add Hapi js validation for the error object and remove this nasty if statements.
              // Handle Network and Request errors and map the result. Only some properties are selected and not all due to circular deps in error object. Not all Axios errors have the same object structure https://dev.to/zelig880/how-to-catch-the-body-of-an-axios-error-4lk0
              result.isAxiosError = err.isAxiosError;
              result.message = err.message;
              if (err.config?.url) result.config.url = err.config?.url;
              if (err.config?.method) result.config.method = err.config.method;
              if (err.config?.headers)
                result.config.headers = err.config.headers;
              if (err.request?._header)
                result.request._header = err.request._header;
              if (err.request?.method)
                result.request.method = err.request.method;
              if (err.request?.path) result.request.path = err.request.path;
              if (err.request?.host) result.request.host = err.request.host;
              if (err.request?.protocol)
                result.request.protocol = err.request.protocol;
              if (err.response?.status)
                result.response.status = err.response.status;
              if (err.response?.statusText)
                result.response.statusText = err.response.statusText;
              if (err.response?.headers)
                result.response.headers = err.response.headers;
              if (err.response?.config)
                result.response.config = err.response.config;

              // We resolve and not reject the Axios error because we need the error object body saved as the scan result for the particular locale scan. Rejecting a promise in Promise.all stops all of the promises.
              resolve({
                title,
                url,
                favicon,
                result
              });
            });
        })
      );
      localesScanned++;
    }
  });

  // Resolve all scan promises
  const scanResults = await Promise.all(scanPromises);

  // Filter scan results for scans with errors
  let totalMissingKeys = 0;
  let totalErrors = 0;
  let totalGtmParserErrors = 0;
  let totalFetchLocaleErrors = 0;

  const stats = [];

  scanResults.forEach(res => {
    if (
      res.result.hasMissingKeys ||
      res.result.hasErrors ||
      res.result.isGtmParserError ||
      res.result.isAxiosError
    ) {
      res.result?.hasMissingKeys && totalMissingKeys++;
      res.result?.hasErrors && totalErrors++;
      res.result?.isGtmParserError && totalGtmParserErrors++;
      res.result?.isAxiosError && totalFetchLocaleErrors++;
      stats.push(res);
    }
  });

  const scanDurationMs = new Date() - scanStart;

  return {
    localesTotal: locales.length,
    localesScanned,
    totalMissingKeys,
    totalErrors,
    totalGtmParserErrors,
    totalFetchLocaleErrors,
    scanDurationMs,
    stats
  };
};

module.exports = gtmScanner;
