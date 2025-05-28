// scripts/crawlLookpin.js

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://www.lookpin.co.kr/home", { waitUntil: "networkidle2" });

  // 기다리는 시간 (데이터가 다 뜰 때까지)
  await new Promise(resolve => setTimeout(resolve, 5000));


  const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll(".sc-88a90ba8-0.eYtZDO"));

    return items.slice(0, 100).map((el, idx) => {
      const name = el.querySelector(".sc-a8ceba9-0")?.innerText || "이름 없음";
      const price = el.querySelector(".sc-6e9935d2-5")?.innerText || "가격 없음";
      return {
        순위: idx + 1,
        상품명: name,
        판매가: price,
      };
    });
  });

  const today = new Date().toISOString().split("T")[0];
  const outputDir = path.join(__dirname, "../data");
  const outputPath = path.join(outputDir, `${today}.json`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✅ ${today} 랭킹 데이터 저장 완료: ${outputPath}`);

  await browser.close();
})();
