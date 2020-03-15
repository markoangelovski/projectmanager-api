const cron = require("node-cron");

cron.schedule("0 * * * SUN", () => {
  console.log("running a task every hour");
});
