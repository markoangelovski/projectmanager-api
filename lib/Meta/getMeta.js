const { getMetadata } = require("page-metadata-parser");
const domino = require("domino");

exports.getMeta = async (data, url) => {
  const doc = domino.createWindow(data).document;
  const metadata = getMetadata(doc, url);
  return metadata;
};
