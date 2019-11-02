const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: {
    type: String,
    required: true,
    match: [
      /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/,
      "Please enter a valid URL."
    ]
  },
  date: { type: Number, default: Date.now },
  order: { type: Number, default: 1 },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  }
});

// not functioning!!!
// Create pre.updateOne hook to validate links
// linkSchema.pre("updateOne", async function(next) {
//   this.set({ updatedAt: Date.now });

//   const query = this._update.$set.link;
//   const regex = this.schema.paths.link.validators[1].regexp;
//   const regexValidator = this.schema.paths.link.validators[1].validator;
//   const match = new RegExp(
//     "^(ht|f)tp(s?)://[0-9a-zA-Z]([-.w]*[0-9a-zA-Z])*(:(0-9)*)*(/?)([a-zA-Z0-9-.?,'/\\+&amp;%$#_]*)?$",
//     "gi"
//   );

//   // console.log("link", this.schema.paths.link);
//   // console.log("set", this._update.$set);
//   console.log("query", query);
//   console.log("regex", regex);
//   console.log("matches", query.match(match));
//   console.log("regexValidator", regexValidator());
//   console.log("match", match);

// if (this.link.match(regex)) {
//   next();
// } else {
//   const err = new Error("Please enter a valid URL.");
//   next(err);
// }
// });

module.exports = mongoose.model("Link", linkSchema);
