const { Telegraf } = require('telegraf');
const puppeteer = require('puppeteer');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('document', async (ctx) => {
  const file = await ctx.telegram.getFile(ctx.message.document.file_id);

  // ✅ FIX 1
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

  const res = await fetch(fileUrl);
  const html = await res.text();

  fs.writeFileSync('input.html', html);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1080,
    height: 1350,
    deviceScaleFactor: 2
  });

  // ✅ FIX 2
  await page.goto(`file://${process.cwd()}/input.html`, {
    waitUntil: 'networkidle0'
  });

  await page.screenshot({
    path: 'output.png'
  });

  await browser.close();

  await ctx.replyWithPhoto({ source: 'output.png' });
});

bot.launch();
