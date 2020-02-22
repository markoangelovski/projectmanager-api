const puppeteer = require("puppeteer");
const fs = require("fs");

const bookMe = async ({ username, password, url, duration, date }) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url);

    // Login to Kanboard
    await page.type("#form-username", username);
    await page.type("#form-password", password);
    await page.click("div.form-actions > button");

    // Click on "Add time spent" link
    const addTimeBtnSelector =
      "#task-view > div.sidebar.sidebar-icons > ul:nth-child(4) > li:nth-child(5) > a";
    await page.waitFor(500);
    await page.waitForSelector(addTimeBtnSelector);
    await page.click(addTimeBtnSelector);

    // Add time and date
    await page.waitForSelector("#modal-box #form-time_spent");
    await page.type("#modal-box #form-time_spent", duration);
    await page.type("#modal-box #form-for_date", date);
    await page.keyboard.press("Escape");

    // Submit booking
    await page.waitFor(200);
    await page.click("div.my-form-actions > button");

    // Create Screenshots folder if it does not exist
    !fs.existsSync("./screenshots") && fs.mkdirSync("./screenshots");

    const scrName = username.split("@");
    const scrDate = date.split("/");
    const num = Math.floor(Math.random() * 100);
    const scr = `${num}-${scrName[0]}-${scrDate[0]}-${scrDate[1]}-${scrDate[2]}`;

    await page.screenshot({
      path: `./screenshots/${scr}.jpeg`,
      type: "jpeg",
      quality: 50
    });
    await browser.close();

    return {
      status: "OK",
      message: "Booking completed successfully!",
      scr
    };
  } catch (error) {
    console.warn(error);
    return {
      status: "ERROR",
      message: "An error occurred."
    };
  }
};

module.exports = bookMe;
