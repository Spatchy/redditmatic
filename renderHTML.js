import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export default async function render (dir) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  const contentArray = fs.readdirSync(dir).filter( (e) => {
    return path.extname(e).toLowerCase() === '.html'
  });
  for(const [i, htmlFile] of contentArray.entries()) {
    console.info("rendering " + i);
    try {
      const htmlString = fs.readFileSync(`${dir}/${htmlFile}`, 'utf-8')
      await page.setContent(htmlString);
      await page.screenshot({path: `${dir}/${i}.png`});
    } catch (err) {
      console.error(err);
    }
  };
  await browser.close();  
}
