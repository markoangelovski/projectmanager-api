const { mongoIdRgx } = require("./regex");

// Validates if passed Mongo IDs are in correct format and if documents exists in DB
const dbModelCheck = async (arr, req) => {
  // arr = [{
  //     _id: Mongo ID,
  //     model: Model,
  //     invalidMsg: "ERR_IDENTIFIER_INVALID",
  //     notFoundMsg: "ERR_NOT_FOUND"
  // }]

  const promiseArray = [];

  arr.forEach(element => {
    // Check if each ID is valid Mongo ID
    const id = mongoIdRgx.test(element._id) && element._id;
    if (!id) throw new Error(element.invalidMsg);

    // Create a DB query for each entry in array
    if (element.notFoundMsg !== "ERR_LOG_NOT_FOUND") {
      promiseArray.push(element.model.exists({ owner: req.user, _id: id }));
    } else {
      // If element is Log, search logs subdocument
      promiseArray.push(
        element.model.exists({ owner: req.user, "logs._id": id })
      );
    }
  });

  // Query DB for each entry
  const promiseResponse = await Promise.all(promiseArray);

  // Throw error if any document is not found in DB
  promiseResponse.forEach((result, i) => {
    if (!result) throw new RangeError(arr[i].notFoundMsg);
  });

  return true;
};

module.exports = dbModelCheck;
