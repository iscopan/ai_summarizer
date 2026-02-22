const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const langs = {
    en: {
        title: "The Future of Artificial Intelligence",
        subtitle: "How AI is Reshaping Our Daily Lives",
        text: "Artificial intelligence is rapidly transforming our daily lives. From smart home assistants that manage our schedules to advanced algorithms that personalize our learning experiences, AI is everywhere.",
        summary: "AI is transforming daily life through smart devices and personalized experiences, offering unprecedented efficiency. However, it also raises important ethical and privacy concerns that society must address."
    },
    es: {
        title: "El Futuro de la Inteligencia Artificial",
        subtitle: "Cómo la IA está Remodelando Nuestras Vidas",
        text: "La inteligencia artificial está transformando rápidamente nuestra vida diaria. Desde asistentes domésticos inteligentes que gestionan nuestros horarios hasta algoritmos avanzados que personalizan nuestras experiencias.",
        summary: "La IA está transformando la vida diaria mediante dispositivos inteligentes y experiencias personalizadas, ofreciendo una eficiencia sin precedentes. Sin embargo, también plantea importantes desafíos éticos."
    },
    fr: {
        title: "L'Avenir de l'Intelligence Artificielle",
        subtitle: "Comment l'IA Façonne Notre Quotidien",
        text: "L'intelligence artificielle transforme rapidement notre vie quotidienne. Des assistants domestiques intelligents qui gèrent nos emplois du temps aux algorithmes avancés, l'IA est partout.",
        summary: "L'IA transforme la vie quotidienne grâce aux appareils intelligents et aux expériences personnalisées. Cependant, elle soulève d'importants problèmes d'éthique et de confidentialité."
    },
    de: {
        title: "Die Zukunft der Künstlichen Intelligenz",
        subtitle: "Wie KI Unser Tägliches Leben Verändert",
        text: "Künstliche Intelligenz verändert unser tägliches Leben in rasantem Tempo. Von intelligenten Heimassistenten, die unsere Termine verwalten, bis hin zu fortschrittlichen Algorithmen ist KI allgegenwärtig.",
        summary: "KI verändert das tägliche Leben durch intelligente Geräte und personalisierte Erlebnisse. Sie wirft jedoch auch wichtige ethische und datenschutzrechtliche Bedenken auf."
    },
    it: {
        title: "Il Futuro dell'Intelligenza Artificiale",
        subtitle: "Come l'IA sta Rimodellando le Nostre Vite",
        text: "L'intelligenza artificiale sta trasformando rapidamente la nostra vita quotidiana. Dagli assistenti domestici intelligenti che gestiscono i nostri impegni ad algoritmi avanzati, l'IA è ovunque.",
        summary: "L'IA sta trasformando la vita quotidiana attraverso dispositivi intelligenti ed esperienze personalizzate. Tuttavia, solleva anche importanti problemi etici e di privacy."
    },
    pt: {
        title: "O Futuro da Inteligência Artificial",
        subtitle: "Como a IA está Moldando as Nossas Vidas",
        text: "A inteligência artificial está transformando rapidamente as nossas vidas diárias. Desde assistentes domésticos inteligentes que gerenciam nossos horários até algoritmos avançados.",
        summary: "A IA está transformando o cotidiano por meio de dispositivos inteligentes e experiências personalizadas. Contudo, levanta importantes questões éticas e de privacidade."
    }
};

const rawPopupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');
const icon128 = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, '..', 'icons', 'icon128.png')).toString('base64')}`;

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    for (const [lang, content] of Object.entries(langs)) {
        console.log(`Generating promo for ${lang}...`);

        const messagesPath = path.join(__dirname, '..', '_locales', lang, 'messages.json');
        const i18n = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
        const t = (key) => i18n[key] ? i18n[key].message : key;

        // Manipulate the original popup.html to inject translations and state
        let popupHtml = rawPopupHtml
            .replace('<script src="popup.js"></script>', '')
            .replace('<span id="btnText">Summarize this page</span>', `<span id="btnText">${t('summarizeBtn')}</span>`)
            .replace('<div id="status"></div>', `<div id="status" class="success">✅ ${t('done')}</div>`)
            .replace('<span class="summary-label" id="summaryLabel">Summary</span>', `<span class="summary-label" id="summaryLabel">${t('summaryLabel')}</span>`)
            .replace('<div id="summary"></div>', `<div id="summary">${content.summary}</div>`)
            .replace('<div id="summary-card">', `<div id="summary-card" class="visible" style="display:block;">`)
            .replace('<button id="summarizeBtn">', `<button id="summarizeBtn" disabled style="opacity:1; cursor:default">`)
            .replace('<span id="btnIcon">⚡</span>', `<span id="btnIcon"></span>`)
            .replace('<span id="footerFree">Free to use</span>', `<span id="footerFree">${t('freeToUse')}</span>`)
            .replace('>Support the project ❤️<', `>${t('donate')}<`);

        const escapedPopupHtml = popupHtml.replace(/"/g, '&quot;');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    width: 1280px;
                    height: 800px;
                    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 80px;
                    box-sizing: border-box;
                }
                
                .left-col {
                    width: 460px;
                    color: white;
                }
                .app-icon {
                    width: 100px;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    margin-bottom: 30px;
                }
                .promo-title {
                    font-size: 54px;
                    font-weight: 700;
                    line-height: 1.1;
                    margin-bottom: 20px;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .promo-subtitle {
                    font-size: 26px;
                    font-weight: 400;
                    color: rgba(255,255,255,0.85);
                    line-height: 1.4;
                }

                .right-col {
                    position: relative;
                    width: 600px;
                    height: 600px;
                }

                .browser {
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .browser-header {
                    height: 50px;
                    background: #f1f3f4;
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .browser-dots {
                    display: flex;
                    gap: 8px;
                }
                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .dot.r { background: #ff5f56; }
                .dot.y { background: #ffbd2e; }
                .dot.g { background: #27c93f; }
                
                .browser-content {
                    padding: 60px;
                    flex: 1;
                }
                .article-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #202124;
                    margin-bottom: 16px;
                    line-height: 1.2;
                }
                .article-sub {
                    font-size: 18px;
                    color: #5f6368;
                    margin-bottom: 24px;
                }
                .article-body {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #3c4043;
                }

                .extension-popup-wrapper {
                    position: absolute;
                    top: 60px;
                    right: 20px;
                    width: 340px;
                    height: 440px;
                    background: #0a1010;
                    border-radius: 12px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px #1e3030;
                    z-index: 20;
                    overflow: hidden;
                }
            </style>
        </head>
        <body>
            <div class="left-col">
                <img src="${icon128}" class="app-icon">
                <div class="promo-title">AI Summarizer</div>
                <div class="promo-subtitle">${t('extDescription')}</div>
            </div>

            <div class="right-col">
                <div class="browser">
                    <div class="browser-header">
                        <div class="browser-dots">
                            <div class="dot r"></div>
                            <div class="dot y"></div>
                            <div class="dot g"></div>
                        </div>
                    </div>
                    <div class="browser-content">
                        <div class="article-title">${content.title}</div>
                        <div class="article-sub">${content.subtitle}</div>
                        <div class="article-body">${content.text}</div>
                    </div>
                </div>

                <div class="extension-popup-wrapper">
                    <iframe srcdoc="${escapedPopupHtml}" style="width:100%; height:100%; border:none; display:block;"></iframe>
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluateHandle('document.fonts.ready');

        // Wait slightly for iframe to render
        await new Promise(r => setTimeout(r, 600));

        await page.screenshot({ path: `promo_store_${lang}.jpg`, type: 'jpeg', quality: 100 });
    }

    await browser.close();
}

run().catch(console.error);
