const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(DATA_DIR, "distroName.json");
const LOGO_DIR = path.join(__dirname, "public/logos");
const RAW_DIR = path.join(__dirname, "raw");
const DISTRO_LIST_FILE = path.join(RAW_DIR, "distro_list.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) return resolve(filePath);

    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filePath);

    proto
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          return downloadImage(res.headers.location, filePath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(filePath, () => {});
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(filePath)));
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

/**
 * Parse ไฟล์ HTML local ของแต่ละ distro
 */
async function parseLocalFile(browser, distro) {
  const htmlFile = path.join(RAW_DIR, `${distro.slug}.html`);

  if (!fs.existsSync(htmlFile)) {
    console.warn(`  ⚠️  ไม่พบไฟล์ ${distro.slug}.html — ข้าม`);
    return null;
  }

  const page = await browser.newPage();
  try {
    // โหลดจาก local file แทน network
    const fileUrl = `file://${htmlFile}`;
    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });

    const fullText = await page.evaluate(() => document.body.textContent);
    const urlMatches = fullText.match(
      /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
    );
    const url = urlMatches?.[0] ?? "";

    const categories = await page.$$eval(
      "a[href*='search.php?category=']",
      (links) => links.map((link) => link.textContent.trim()),
    );

    const desktop = await page.$$eval(
      "a[href*='search.php?desktop=']",
      (links) => links.map((link) => link.textContent.trim()),
    );

    const basedOn = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll("a[href*='search.php?basedon=']"),
      );
      if (links.length > 0) return links[0].textContent.trim();

      const basedOnHeader = Array.from(document.querySelectorAll("b")).find(
        (el) => el.textContent.trim() === "Based on:",
      );
      if (basedOnHeader) {
        let text = "";
        let sibling = basedOnHeader.nextSibling;
        while (sibling) {
          if (sibling.nodeType === Node.TEXT_NODE) text += sibling.textContent;
          else if (sibling.nodeType === Node.ELEMENT_NODE) text += sibling.textContent;
          sibling = sibling.nextSibling;
        }
        return text.trim().replace(/<br>/gi, "").replace(/^\s*,\s*/, "");
      }
      return "";
    });

    // ดึง src ของ logo จาก HTML (path เป็น relative ของ distrowatch.com)
    const logoSrc = await page.$eval(
      "img.logo",
      (el) => el.getAttribute("src"),
    ).catch(() => null);

    // Download logo จาก distrowatch.com จริง (ดึงครั้งเดียว cache ไว้)
    let logoPath = null;
    if (logoSrc) {
      const logoUrl = logoSrc.startsWith("http")
        ? logoSrc
        : `https://distrowatch.com/${logoSrc}`;
      const ext = path.extname(logoSrc) || ".png";
      const logoFile = path.join(LOGO_DIR, `${distro.slug}${ext}`);
      try {
        await downloadImage(logoUrl, logoFile);
        logoPath = `/logos/${distro.slug}${ext}`;  // relative path สำหรับ frontend
      } catch (e) {
        console.warn(`  ⚠️  logo ดาวน์โหลดไม่ได้: ${e.message}`);
      }
    }

    return { name: distro.name, slug: distro.slug, basedOn, categories, desktop, url, logo: logoPath };
  } catch (err) {
    console.error(`❌ Error ${distro.name}:`, err.message);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Parse ทุกไฟล์แบบ concurrent
 */
async function parseAll(browser, distroList, concurrency = 5) {
  const result = [];
  let processed = 0;

  for (let i = 0; i < distroList.length; i += concurrency) {
    const batch = distroList.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (distro) => {
        const data = await parseLocalFile(browser, distro);
        processed++;
        if (data) console.log(`${processed}/${distroList.length} ✅ ${distro.name}`);
        return data;
      }),
    );

    result.push(...batchResults.filter(Boolean));
  }

  return result;
}

// ── Main ────────────────────────────────────────────────────────────
(async () => {
  console.log("🚀 เริ่ม parse จากไฟล์ local...");

  // อ่าน distro list
  let distroList;
  try {
    distroList = JSON.parse(fs.readFileSync(DISTRO_LIST_FILE, "utf-8"));
  } catch {
    console.error("❌ ไม่พบ raw/distro_list.json");
    process.exit(1);
  }

  // เช็กว่าไฟล์ไหนมีอยู่จริง
  const available = distroList.filter((d) =>
    fs.existsSync(path.join(RAW_DIR, `${d.slug}.html`)),
  );
  const missing = distroList.length - available.length;

  console.log(`📋 ทั้งหมด : ${distroList.length} distros`);
  console.log(`📂 มีไฟล์  : ${available.length} ตัว`);
  if (missing > 0) console.log(`⚠️  ขาดไฟล์ : ${missing} ตัว`);
  console.log();

  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const finalData = await parseAll(browser, available, 5);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), "utf-8");
    console.log(`\n🎉 เสร็จสิ้น! บันทึก ${finalData.length} distro → ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err);
  } finally {
    await browser.close();
  }
})();