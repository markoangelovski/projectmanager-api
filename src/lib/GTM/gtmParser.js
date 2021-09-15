const cheerio = require("cheerio");
const axios = require("axios");

const gtmParser = data => {
  const $ = cheerio.load(data);
  let starts = [];

  // Iterate through <script> tags, find the one containing PGdataLayer and split its contents by "{"
  $("script").each(function (i, elem) {
    $(this)
      .html()
      .match(/GTM(":|':|:|=| =)/g) && !starts.length // take only first instance of GTM occurring
      ? (starts = $(this)
          .html()
          .split(/GTM(":|':|:|=| =)({| {)/))
      : null;
  });
  if (starts.length === 0) {
    return {};
  }

  // Iterate over split elements, find GTM content, remove empty spaces, split the extra content at the end of GTM
  let GTMraw;
  starts.forEach((start, i) => {
    start.match(/Site/)
      ? (GTMraw = start
          .replace(/\r?\n|\r|\s/g, "")
          .split(/("}|" }|'}|' }|}}|},)/)[0]
          .trim()
          .concat("", '"'))
      : null;
  });

  // Check for single quotes and change to double quotes
  GTMraw.match(/'/g) ? (GTMraw = GTMraw.replace(/'/g, '"')) : null;

  // Fix last character if not quotation mark
  GTMraw.slice(-2) === '}"'
    ? ((GTMraw = GTMraw.slice(0, -2)), console.log(`GTM ended with a '}"'`))
    : GTMraw;

  // Split GTM data into array and trim extra spacings
  let GTMarray = GTMraw.split(",").map(key => key.trim());
  let tempKey = [];
  let GTM;

  // Check if GTM data is valid JSON and convert if not
  if (GTMraw[0] !== '"') {
    // Split "key:value" pairs by ":" into "value, key" to remove ":"
    GTMarray.forEach((key, i) => (tempKey[i] = key.split(":")));
    // Join individual arrays and split "value, key" pairs by "," to get sngle values
    tempKey = tempKey
      .join()
      .split(",")
      .map(key => key.trim());
    // Check which values don't have double quotations and insert them
    tempKey = tempKey.map(key => (key[0] !== '"' ? `"${key}"` : key));
    // Join single values into "key:value" pairs
    for (let i = 0, x = 1; i < tempKey.length; i++, x++) {
      tempKey[i] = `${tempKey[i]}:${tempKey[x]}`;
    }
    // Remove extra values from array
    for (let i = 0; i < tempKey.length; i++) {
      tempKey.splice(i + 1, 1);
    }
    // Join "key:value" pars into final GTM object
    GTM = `{${tempKey.join()}}`;
  } else {
    // Join "key:value" pars into final GTM object
    GTM = `{${GTMarray.join()}}`;
  }

  // Case where only some of the keys are not valid json, and have uneven number of double quotation marks
  if ((GTM.match(/"/g) || []).length % 2) {
    // Remove {, } and " characters and split the string into array by ","
    GTM = GTM.replace(/"|{|}/g, "");
    let GTMarr = GTM.split(",");

    let tempArr = [];
    let newGTM = "";

    // Split the first arr by ":"
    GTMarr.forEach(el => {
      let tempEl = el.split(":");
      tempArr.push(tempEl);
    });

    // Iterate over split elements and join them in a string, adding the initially missng '"' character
    tempArr = tempArr.forEach(el => {
      newGTM += `"${el[0]}":"${el[1]}",`;
    });

    // Remove extra "," from the end
    newGTM = newGTM.slice(0, -1);

    GTM = `{${newGTM}}`;
  }

  // For edge cases where there are some mistakes in the GTM object, like another object is added.
  // Example on metamucil.com.br, user object was added in the GTM object (at the very end of the object) instead beside. In the end, the last } was missing, hence adding it here.
  const noOfCurlyBracesMatch =
    GTM.match(/{/g).length === GTM.match(/}/g).length;
  if (!noOfCurlyBracesMatch) {
    GTM = GTM + "}";
  }

  // Remove GoogleReCaptcha key from GTM due to errors with scanning
  const finalGTM = JSON.parse(GTM);
  delete finalGTM.GoogleReCaptcha;

  // For instances where GTM parsing inserts empty keys with undefined values into final GTM, ie. "":"undefined"
  for (const key in finalGTM) {
    if (Object.hasOwnProperty.call(finalGTM, key)) {
      if (!key.length) delete finalGTM[key];
    }
  }

  return finalGTM;
};

const globalGtmParser = async data => {
  const $ = cheerio.load(data);

  const rgxManager = new RegExp(/googletagmanager/g);
  const rgxGTM = new RegExp(/GTM-[a-zA-Z0-9]{7}/g);
  const rgxLocale = new RegExp(/\/[a-z]{2}-[a-z]{2}\/$/);

  // Parse canonical link and remove trailing slash and locale folder/extension, ie. /en-us/
  let canonical = $('link[rel="canonical"]').attr("href");
  if (rgxLocale.test(canonical)) canonical = canonical.replace(rgxLocale, "");

  if (canonical && canonical[canonical.length - 1] === "/")
    canonical = canonical.slice(0, canonical.length - 1);

  let gtmInline, gtmSrc, gtmExtSrc;

  // Iterate through <script> tags, find the one containing the global GTM script and extract local GTM from PGDL
  $("script").each(function (i, elem) {
    if ($(this).html().match(rgxManager))
      gtmInline = $(this).html().match(rgxGTM);

    if (this.attribs.src && this.attribs.src.match(/gtm/g))
      gtmSrc = this.attribs.src;
  });

  // Create proper URL for external GTM script
  if (gtmSrc && gtmSrc[0] !== "h") gtmExtSrc = canonical + gtmSrc;

  if (gtmInline) {
    // If global GTM script is internal, return GTM property
    return gtmInline.join();
  } else if (gtmExtSrc) {
    // If global GTM script is external, fetch the gtm script and return GTM property
    const res = await axios.get(gtmExtSrc);
    const gtmExternal = res.data.match(rgxGTM);
    return gtmExternal.join();
  } else {
    return "No Global GTM found";
  }
};

module.exports = { gtmParser, globalGtmParser };
