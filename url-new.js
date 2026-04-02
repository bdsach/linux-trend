const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const distroUrl = "https://distrowatch.com/dwres.php?resource=popularity";
const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(DATA_DIR, "distroName.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/**
 * Scrape หน้า detail แบบเร็ว (concurrent)
 */
async function scrapeDetails(browser, allDistros, concurrency = 5) {
  const result = [];
  let processed = 0;

  for (let i = 0; i < allDistros.length; i += concurrency) {
    const batch = allDistros.slice(i, i + concurrency);

    const batchPromises = batch.map(async (distro) => {
      const page2 = await browser.newPage();
      try {
        await page2.goto(
          `https://distrowatch.com/table.php?distribution=${distro.slug}`,
          {
            waitUntil: "networkidle2",
          },
        );

        const fullText = await page2.evaluate(() => document.body.textContent);
        const urlMatches = fullText.match(
          /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
        );
        const url = urlMatches?.[0] ?? "";

        const categories = await page2.$$eval(
          "a[href*='search.php?category=']",
          (links) => links.map((link) => link.textContent.trim()),
        );

        const desktop = await page2.$$eval(
          "a[href*='search.php?desktop=']",
          (links) => links.map((link) => link.textContent.trim()),
        );

        // const basedOnArray = await page2.$$eval(
        //   "a[href*='search.php?basedon=']",
        //   (links) => links.map((link) => link.textContent.trim()),
        // );

        // const basedOn = basedOnArray.length > 0 ? basedOnArray[0] : "";
        const basedOn = await page2.evaluate(() => {
          // 1. ลองหาลิงก์ก่อน (แบบ Debian, Ubuntu ...)
          const links = Array.from(
            document.querySelectorAll("a[href*='search.php?basedon=']"),
          );
          if (links.length > 0) {
            return links[0].textContent.trim(); // เก็บตัวแรกเหมือนเดิม
          }

          // 2. ถ้าไม่มีลิงก์ → เป็น Independent หรือข้อความธรรมดา
          const basedOnHeader = Array.from(document.querySelectorAll("b")).find(
            (el) => el.textContent.trim() === "Based on:",
          );

          if (basedOnHeader) {
            let text = "";
            let sibling = basedOnHeader.nextSibling;
            while (sibling) {
              if (sibling.nodeType === Node.TEXT_NODE) {
                text += sibling.textContent;
              } else if (sibling.nodeType === Node.ELEMENT_NODE) {
                text += sibling.textContent;
              }
              sibling = sibling.nextSibling;
            }
            return text
              .trim()
              .replace(/<br>/gi, "")
              .replace(/^\s*,\s*/, "");
          }

          return ""; // กรณีหาไม่เจอ
        });

        processed++;
        console.log(`${processed}/${allDistros.length} ✅ ${distro.name}`);

        return { name: distro.name, basedOn, categories, desktop, url };
      } catch (err) {
        console.error(`❌ Error ${distro.name}:`, err.message);
        return null;
      } finally {
        await page2.close();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    result.push(...batchResults.filter(Boolean));
  }
  return result;
}

/**
 * โปรแกรมหลัก
 */
(async () => {
  console.log("🚀 เริ่ม scrape DistroWatch...");

  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const page = await browser.newPage();
    await page.goto(distroUrl, { waitUntil: "networkidle2" });

    // === ดึงรายชื่อทั้งหมดครั้งเดียว + คัดซ้ำทันที ===
    const allDistrosRaw = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("td.phr2 > a"));
      return links
        .map((link) => ({
          name: link.textContent.trim(),
          slug: link.getAttribute("href"),
        }))
        .filter((item) => item.name && item.slug);
    });

    console.log(`✅ พบ distro ทั้งหมด ${allDistrosRaw.length} รายการ`);

    // คัดซ้ำ (กันกรณีมีซ้ำจริง)
    const allDistros = Array.from(
      new Map(allDistrosRaw.map((d) => [d.slug, d])).values(),
    );

    if (allDistrosRaw.length !== allDistros.length) {
      console.log(
        `⚠️  มีซ้ำ ${allDistrosRaw.length - allDistros.length} รายการ ถูกตัดออกแล้ว`,
      );
    }

    // === Scrape หน้า detail ===
    const finalData = await scrapeDetails(browser, allDistros, 5);

    // === บันทึกไฟล์ ===
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), "utf-8");

    console.log(
      `🎉 เสร็จสิ้น! บันทึกข้อมูล ${finalData.length} distro เรียบร้อย`,
    );
    console.log(`📁 ไฟล์อยู่ที่ → ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err);
  } finally {
    await browser.close();
  }
})();
