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

  // 렌더링 시간 확보
  await page.waitForTimeout(7000);

  const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("div[class*='eYtZDO']"));

    return items.slice(0, 100).map((el, idx) => {
      const name = el.querySelector("div[class*='a8ceba9']")?.innerText || "상품명 없음";
      const price = el.querySelector("div[class*='6e9935d2']")?.innerText || "가격 없음";
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

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✅ ${today} 랭킹 데이터 저장 완료: ${outputPath}`);
  await browser.close();
})();
