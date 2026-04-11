#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const RAW_DIR = './raw';
const JSON_FILE = './raw/distro_list.json';

if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log(`สร้างโฟลเดอร์ ${RAW_DIR}/ เรียบร้อย`);
}

console.log('กำลังอ่าน distro_list.json...\n');

let distroList;
try {
    const data = fs.readFileSync(JSON_FILE, 'utf-8');
    distroList = JSON.parse(data);
} catch (err) {
    console.error('❌ ไม่พบไฟล์ distro_list.json ที่ path:', JSON_FILE);
    process.exit(1);
}

// ── ตรวจสอบ list ทั้งหมดก่อน ──────────────────────────────────────
function checkExisting(distroList) {
    const missing = [];
    const skipped = [];

    for (const distro of distroList) {
        const filename = path.join(RAW_DIR, `${distro.slug}.html`);
        const exists = fs.existsSync(filename);
        const validSize = exists && fs.statSync(filename).size > 8000;

        if (validSize) {
            skipped.push(distro.slug);
        } else {
            missing.push(distro);
        }
    }

    return { missing, skipped };
}

const { missing, skipped } = checkExisting(distroList);

console.log(`📋 ทั้งหมด     : ${distroList.length} distros`);
console.log(`✅ มีแล้ว (ข้าม): ${skipped.length} ตัว`);
console.log(`📥 ต้องโหลด    : ${missing.length} ตัว\n`);

if (missing.length === 0) {
    console.log('🎉 ครบทุกตัวแล้ว ไม่ต้องโหลดเพิ่ม!');
    process.exit(0);
}

// ── โหลดเฉพาะที่ขาด ───────────────────────────────────────────────
let success = 0;
let failed = 0;

async function downloadAll() {
    for (const distro of missing) {
        const { slug, name } = distro;
        const filename = path.join(RAW_DIR, `${slug}.html`);
        const url = `https://distrowatch.com/table.php?distribution=${encodeURIComponent(slug)}`;

        process.stdout.write(`📥 ${name.padEnd(22)} (${slug}) ... `);

        try {
            const command = `curl -s --max-time 45 -L "${url}" -o "${filename}"`;
            execSync(command, { stdio: 'ignore' });

            const stats = fs.statSync(filename);
            if (stats.size > 8000) {
                console.log(`✅  (${(stats.size / 1024).toFixed(1)} KB)`);
                success++;
            } else {
                console.log(`⚠️  ไฟล์เล็กเกินไป`);
                failed++;
            }
        } catch (err) {
            console.log(`❌ ล้มเหลว`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 700));
    }

    console.log('\n🎉 ดาวน์โหลดเสร็จสิ้น!');
    console.log(`สำเร็จ : ${success} ตัว`);
    console.log(`ล้มเหลว: ${failed} ตัว`);
}

downloadAll().catch(err => {
    console.error('เกิดข้อผิดพลาดใหญ่:', err);
});