const fs = require("fs");

const html = fs.readFileSync("./raw/distro-list.html", "utf-8");

const distros = new Map();

// รายการ blacklist ที่ไม่ใช่ distro
const blacklist = new Set([
  "./",
  "javascript:void(0)",
  "#",
  " ",
  "",
  "Select Distribution",
  "Home Page",
  "Headlines",
  "DW Weekly",
  "Packages",
  "Search",
  "Sitemap",
  "About DistroWatch",
  "Beginner's Guide",
  "Random Distribution",
  "Jesse Smith",
  "Contact",
  "Privacy policy",
  "Change privacy settings",
]);

// 1. ดึงจาก <a href="..."> ในตาราง
const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
let match;

while ((match = linkRegex.exec(html)) !== null) {
  let slug = match[1].trim();
  let name = match[2].trim();

  // กรองเข้มงวด
  if (
    !slug ||
    slug.startsWith("http") ||
    slug.startsWith("/") ||
    slug.startsWith("#") ||
    slug.includes(".php") ||
    slug.includes(".html") ||
    slug.includes("javascript") ||
    blacklist.has(slug) ||
    blacklist.has(name) ||
    slug.length < 2 ||
    name.length < 2
  ) {
    continue;
  }

  distros.set(slug, name);
}

// 2. ดึงจาก <select> dropdown (ส่วนนี้มักสะอาดกว่า)
const optionRegex = /<option[^>]+value="([^"]*)"[^>]*>(.*?)<\/option>/gi;

while ((match = optionRegex.exec(html)) !== null) {
  let slug = match[1].trim();
  let name = match[2]
    .trim()
    .replace(/^<<|&lt;&lt;/g, "")
    .trim();

  if (
    !slug ||
    slug === "" ||
    slug === "Select Distribution" ||
    slug.length < 2 ||
    blacklist.has(slug)
  ) {
    continue;
  }

  // ใช้ชื่อจาก dropdown ถ้ายาวกว่า หรือยังไม่มี
  if (!distros.has(slug) || name.length > (distros.get(slug) || "").length) {
    distros.set(slug, name);
  }
}

// แปลงเป็น array และเรียงตาม slug
const distroList = Array.from(distros.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([slug, name]) => ({ slug, name }));

// บันทึกไฟล์
fs.writeFileSync("./raw/distro_list.json", JSON.stringify(distroList, null, 2));

console.log(`พบ distros ทั้งหมด ${distroList.length} ตัว`);
console.log("บันทึกไฟล์ distro_list.json เรียบร้อยแล้ว");

// แสดงตัวอย่าง 15 ตัวแรก
console.table(distroList.slice(0, 15));
