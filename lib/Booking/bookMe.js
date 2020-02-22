const puppeteer = require("puppeteer");

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

    const scrDate = date.split("/");
    await page.screenshot({
      path: `./screenshots/scr-${username}-${scrDate[0]}-${scrDate[1]}-${scrDate[2]}.jpeg`,
      type: "jpeg",
      quality: 50
    });
    await browser.close();

    return {
      status: "OK",
      message: "Booking completed successfully!"
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
