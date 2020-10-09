const cron = require("node-cron");
const os = require("os");

setInterval(() => {
    console.log("Running interval!");
}, 2*60*1000);

cron.schedule("* * * * *", () => {
  console.log("Heartbeet");
  console.log("os.uptime(): ", os.uptime());
  console.log("os.arch(): ", os.arch());
  console.log("os.platform(): ", os.platform());
  console.log("os.type(): ", os.type());
  console.log("os.cpus(): ", os.cpus());
  console.log("os.freemem(): ", os.freemem());
  console.log("os.totalmem(): ", os.totalmem());
  console.log("os.homedir(): ", os.homedir());
  console.log("os.hostname(): ", os.hostname());
  console.log("_____________________");

});
