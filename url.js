const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const distroUrl = "https://distrowatch.com/dwres.php?resource=popularity";

const scrap = async (section, col) => {
  const totalDistro = 271;

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

  const savePath = path.join(`${__dirname}/data/distroName${section}_${col}.json`);
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
      `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(${col}) > table > tbody > tr:nth-child(${i}) > td.phr2 > a`
    );

    // body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1)

    // body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2)

    // body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(3)

    // body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(4)

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

    const categories = await page2.$$eval(
      "a[href*='search.php?category=']",
      (links) => links.map((link) => link.textContent)
    );

    const desktop = await page2.$$eval(
      "a[href*='search.php?desktop=']",
      (links) => links.map((link) => link.textContent)
    );

    const url = getUrl[1];

    console.log(i - 1, nameEvaluate, url, "✅");

    result.push({
      name: nameEvaluate,
      categories,
      desktop,
      url,
    });
    await browser.close();
  }

  fs.writeFile(savePath, JSON.stringify(result), "utf-8", (err) => {
    if (!err) {
      console.log("saved! ✨");
    }
  });
};

// function mergeUrl() {
//   const data1 = require("./data/distroName1.json");
//   const data2 = require("./data/distroName2.json");
//   const data3 = require("./data/distroName3.json");
//   const data4 = require("./data/distroName4.json");
//   const data5 = require("./data/distroName5.json");

//   const result = [...data1, ...data2, ...data3, ...data4, ...data5];

//   fs.writeFile(
//     "./data/distroName.json",
//     JSON.stringify(result),
//     "utf-8",
//     (err) => {
//       if (!err) {
//         console.log("saved! ✨");

//         for (let i = 1; i < 6; i++) {
//           fs.unlink(`./data/distroName${i}.json`, (err) => {
//             if (!err) {
//               console.log(`distroName${i}.json deleted! 🔥`);
//             }
//           });
//         }
//       } else {
//         console.log(err);
//       }
//     }
//   );
// }

function mergeUrl() {
  const data1_1 = require("./data/distroName1_1.json");
  const data1_2 = require("./data/distroName1_2.json");
  const data1_3 = require("./data/distroName1_3.json");
  const data1_4 = require("./data/distroName1_4.json");
  const data2_1 = require("./data/distroName2_1.json");
  const data2_2 = require("./data/distroName2_2.json");
  const data2_3 = require("./data/distroName2_3.json");
  const data2_4 = require("./data/distroName2_4.json");
  const data3_1 = require("./data/distroName3_1.json");
  const data3_2 = require("./data/distroName3_2.json");
  const data3_3 = require("./data/distroName3_3.json");
  const data3_4 = require("./data/distroName3_4.json");
  const data4_1 = require("./data/distroName4_1.json");
  const data4_2 = require("./data/distroName4_2.json");
  const data4_3 = require("./data/distroName4_3.json");
  const data4_4 = require("./data/distroName4_4.json");
  const data5_1 = require("./data/distroName5_1.json");
  const data5_2 = require("./data/distroName5_2.json");
  const data5_3 = require("./data/distroName5_3.json");
  const data5_4 = require("./data/distroName5_4.json");

  // Combine all the data arrays
  const combinedData = [...data1_1, ...data1_2, ...data1_3, ...data1_4, ...data2_1, ...data2_2, ...data2_3, ...data2_4, ...data3_1, ...data3_2, ...data3_3, ...data3_4, ...data4_1, ...data4_2, ...data4_3, ...data4_4, ...data5_1, ...data5_2, ...data5_3, ...data5_4];

  // Remove duplicates by 'name' and merge categories/desktop arrays
  const mergedData = Array.from(
    combinedData.reduce((map, item) => {
      if (!map.has(item.name)) {
        map.set(item.name, { ...item });
      } else {
        const existing = map.get(item.name);
        existing.categories = Array.from(new Set([...existing.categories, ...item.categories]));
        existing.desktop = Array.from(new Set([...existing.desktop, ...item.desktop]));
      }
      return map;
    }, new Map()).values()
  );

  // Write merged data to a new file
  fs.writeFile("./data/distroName.json", JSON.stringify(mergedData, null, 2), "utf-8", (err) => {
    if (!err) {
      console.log("saved! ✨");

      // // Delete the old JSON files after merging
      // for (let i = 1; i <= 5; i++) {
      //   fs.unlink(`./data/distroName${i}.json`, (err) => {
      //     if (!err) {
      //       console.log(`distroName${i}.json deleted! 🔥`);
      //     } else {
      //       console.log(`Error deleting distroName${i}.json:`, err);
      //     }
      //   });
      // }
    } else {
      console.log("Error saving merged data:", err);
    }
  });
}

// scrap(1, 1);
// scrap(1, 2);
// scrap(1, 3);
// scrap(1, 4);
// scrap(2, 1);
// scrap(2, 2);
// scrap(2, 3);
// scrap(2, 4);
// scrap(3, 1);
// scrap(3, 2);
// scrap(3, 3);
// scrap(3, 4);
// scrap(4, 1);
// scrap(4, 2);
// scrap(4, 3);
// scrap(4, 4);
// scrap(5, 1);
// scrap(5, 2);
// scrap(5, 3);
// scrap(5, 4);

// scrap(2);
// scrap(3);
// scrap(4);
// scrap(5);
// mergeUrl();
