const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const distroName = require("./data/distroName.json");
const BASE_LOGO_URL = "https://raw.githubusercontent.com/bdsach/linux-trend/refs/heads/main/public/logos";

const svgLogoSet = new Set(
  fs.readdirSync(path.join(__dirname, "public/logos"))
    .filter(f => f.endsWith(".svg"))
    .map(f => f.replace(".svg", ""))
);

function getLogo(name) {
  const nameLower = name.toLocaleLowerCase();
  return svgLogoSet.has(nameLower)
    ? `${BASE_LOGO_URL}/${nameLower}.svg`
    : `${BASE_LOGO_URL}/${nameLower}.png`;
}

function getDesktop(name) {
  const foundItem = distroName.find((item) => item.name === name);
  if (foundItem) return foundItem.desktop;
  console.error(`No desktop found for: ${name}`);
  return null;
}

function getCategory(name) {
  const foundItem = distroName.find((item) => item.name === name);
  if (foundItem) return foundItem.categories;
  console.error(`No category found for: ${name}`);
  return null;
}

// === read from file raw/distro-list.html ===
const scrap = async (childNum = 2) => {
  let month = 0;
  let resultObj = {
    createAt: new Date().toISOString(),
    data: [],
  };

  switch (childNum) {
    case 1: month = 12; break;
    case 2: month = 6; break;
    case 3: month = 3; break;
    case 4: month = 1; break;
    default: return;
  }

  const savePath = path.join(__dirname, `data/last${month}months.json`);
  console.log(`Processing last ${month} months from ./raw/distro-list.html ⏳`);

  // read file ./raw/distro-list.html
  let htmlContent;
  try {
    htmlContent = fs.readFileSync("./raw/distro-list.html", "utf8");
  } catch (err) {
    console.error("notfound ./raw/distro-list.html.!");
    return;
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const distroCount = 272;

  for (let i = 2; i < distroCount; i++) {
    try {
      const nameSelector = `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(${childNum}) > table > tbody > tr:nth-child(${i}) > td.phr2 > a`;
      const rankSelector = `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(${childNum}) > table > tbody > tr:nth-child(${i}) > td.phr3`;
      const trendSelector = `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(${childNum}) > table > tbody > tr:nth-child(${i}) > td.phr3 > img`;
      const yesterdaySelector = `body > table.NavLogo > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(${childNum}) > table > tbody > tr:nth-child(${i}) > td.phr3`;

      const nameEvaluate = await page.$eval(nameSelector, el => el.textContent.trim());
      const rankEvaluate = await page.$eval(rankSelector, el => el.textContent.trim());
      const trendEvaluate = await page.$eval(trendSelector, el => el.getAttribute("src"));
      const yesterdayEvaluate = await page.$eval(yesterdaySelector, el => el.getAttribute("title"));

      const getTrend = trendEvaluate.split("/")[2].split(".")[0].slice(1);

      let url = "";
      const found = distroName.find(item => item.name === nameEvaluate);
      if (found) url = found.url || "";

      resultObj.data.push({
        no: i - 1,
        name: nameEvaluate,
        rank: parseInt(rankEvaluate),
        trend: getTrend,
        url: url,
        logo: getLogo(nameEvaluate),
        category: getCategory(nameEvaluate),
        desktop: getDesktop(nameEvaluate),
        yesterday: parseInt(yesterdayEvaluate.slice(11, 15)) || 0,
      });

    } catch (err) {
      console.warn(`skip ${i}`);
      // break;
    }
  }

  fs.writeFileSync(savePath, JSON.stringify(resultObj, null, 2), "utf-8");
  console.log(`✅ last${month}months.json saved successfully!`);

  await browser.close();
};

async function callScrapSequentially() {
  const scrapCalls = [1, 2, 3, 4];

  for (const value of scrapCalls) {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await scrap(value);
        console.log(`Scrap call ${value} succeeded.`);
        break;
      } catch (error) {
        console.error(`Scrap call ${value} failed:`, error.message);
        retryCount++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  console.log("All scrap calls finished.");
  process.exit(0);
}

callScrapSequentially();