const t = (key) => chrome.i18n.getMessage(key) || key;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('settingsTitle').textContent = t('settingsTitle');
    document.getElementById('settingsTagline').textContent = t('settingsTagline');
    document.getElementById('howToUseTitle').textContent = '📖 ' + t('howToUse');
    document.getElementById('step1').textContent = t('step1');
    document.getElementById('step2').textContent = t('step2');
    document.getElementById('step3').textContent = t('step3');
    document.getElementById('step4').textContent = t('step4');
    document.getElementById('supportTitle').textContent = '💙 ' + t('supportTitle');
    document.getElementById('supportDesc').textContent = t('supportDesc');
    document.getElementById('donateBtn').textContent = '❤️ ' + t('donateBtn');
    document.getElementById('githubBtn').textContent = '💻 ' + t('githubBtn');
});
