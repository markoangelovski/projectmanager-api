const { gtmParser, globalGtmParser } = require("./gtmParser");
const gtmScanner = require("./gtmScanner");
const { gtmCompare, gtmGlobalCompare } = require("./gtmCompare");

module.exports = {
  parse: gtmParser,
  parseGlobal: globalGtmParser,
  scan: gtmScanner,
  compare: gtmCompare,
  compareGlobal: gtmGlobalCompare
};
