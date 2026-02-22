const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const icon128 = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, '..', 'icons', 'icon128.png')).toString('base64')}`;

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Chrome Web Store Small Promo Tile exact dimensions
    await page.setViewport({ width: 440, height: 280, deviceScaleFactor: 1 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 440px;
                height: 280px;
                background: linear-gradient(135deg, #0a1010 0%, #172a2a 50%, #0d9488 100%);
                font-family: 'Inter', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .app-icon {
                width: 96px;
                height: 96px;
                border-radius: 20px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                margin-bottom: 20px;
            }
            .title {
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -0.5px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.4);
            }
            .badge {
                margin-top: 12px;
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.2);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                color: #2dd4bf;
            }
        </style>
    </head>
    <body>
        <img src="${icon128}" class="app-icon">
        <div class="title">AI Summarizer</div>
        <div class="badge">Summarize any page</div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluateHandle('document.fonts.ready');

    await page.screenshot({ path: 'promo_tile_440x280.jpg', type: 'jpeg', quality: 100 });
    await browser.close();
}

run().catch(console.error);
