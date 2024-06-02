const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const distroUrl = "https://distrowatch.com/dwres.php?resource=popularity";

const scrap = async (section) => {
  const totalDistro = 274;

  let result = [];
  let start = 2;
  let end = 3;

  switch (section) {
    case 1:
      start = 2;
      end = 52;
      break;
    case 2:
      start = 52;
      end = 102;
      break;
    case 3:
      start = 102;
      end = 152;
      break;
    case 4:
      start = 152;
      end = 202;
      break;
    case 5:
      start = 202;
      end = totalDistro;
      break;
    default:
      break;
  }

  const savePath = path.join(`${__dirname}/data/distroName${section}.json`);
  console.log("Start get URL and save to =>", savePath);

  for (let i = start; i < end; i++) {
    const browser = await puppeteer.launch({
      headless: "new",
    });
    // page 1
    const page1 = await browser.newPage();
    await page1.goto(distroUrl, {
      waitUntil: "networkidle2",
    });

    const nameSelector = await page1.waitForSelector(
      `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(${i}) > td.phr2 > a`
    );

    const nameEvaluate = await nameSelector.evaluate(
      (element) => element.textContent,
      nameSelector
    );

    const urlEvaluate = await nameSelector.evaluate(
      (element) => element.getAttribute("href"),
      nameSelector
    );

    // page 2
    const page2 = await browser.newPage();
    await page2.goto(
      `https://distrowatch.com/table.php?distribution=${urlEvaluate}`,
      {
        waitUntil: "networkidle2",
      }
    );

    const linkSelector = await page2.waitForSelector(`*`);

    const linkEvaluate = await linkSelector.evaluate(
      (element) => element.textContent,
      linkSelector
    );

    const getUrl = linkEvaluate.match(
      /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
    );

    const url = getUrl[1];

    console.log(i - 1, nameEvaluate, url, "✅");

    result.push({
      name: nameEvaluate,
      url,
      logo: "",
    });
    await browser.close();
  }

  fs.writeFile(savePath, JSON.stringify(result), "utf-8", (err) => {
    if (!err) {
      console.log("saved! ✨");
    }
  });
};

function mergeUrl() {
  const data1 = require("./data/distroName1.json");
  const data2 = require("./data/distroName2.json");
  const data3 = require("./data/distroName3.json");
  const data4 = require("./data/distroName4.json");
  const data5 = require("./data/distroName5.json");

  const result = [...data1, ...data2, ...data3, ...data4, ...data5];

  fs.writeFile(
    "./data/distroName.json",
    JSON.stringify(result),
    "utf-8",
    (err) => {
      if (!err) {
        console.log("saved! ✨");

        for (let i = 1; i < 6; i++) {
          fs.unlink(`./data/distroName${i}.json`, (err) => {
            if (!err) {
              console.log(`distroName${i}.json deleted! 🔥`);
            }
          });
        }
      } else {
        console.log(err);
      }
    }
  );
}

// scrap(1)
// scrap(2)
// scrap(3)
// scrap(4)
// scrap(5)
// mergeUrl()
