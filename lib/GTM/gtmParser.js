const cheerio = require("cheerio");

const gtmParser = data => {
  const $ = cheerio.load(data);
  let starts = [];

  // Iterate through <script> tags, find the one containing PGdataLayer and split its contents by "{"
  $("script").each(function(i, elem) {
    $(this)
      .html()
      .match(/GTM(":|':|:|=| =)/g)
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
          .split(/("}|" }|'}|' }|}})/)[0]
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

  return JSON.parse(GTM);
};

module.exports = gtmParser;
