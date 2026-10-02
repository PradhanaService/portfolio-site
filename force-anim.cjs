const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Force work animation to play unconditionally on load/navigate
const oldPlayWorkAnim = `  const triggerCheck = () => {
    if (hasTriggered) return;
    if (animContainer.classList.contains('visible') || isElementInViewport(animContainer)) {
      hasTriggered = true;
      playAnimation();
    }
  };`;

const newPlayWorkAnim = `  const triggerCheck = () => {
    if (hasTriggered) return;
    hasTriggered = true;
    setTimeout(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                playAnimation();
            });
        });
    }, 100);
  };`;

scriptJs = scriptJs.replace(oldPlayWorkAnim, newPlayWorkAnim);

// 2. Make sure renderHeroBarChart triggers properly by forcing it slightly after DOM replace
const oldRenderChartPattern = /if \(window\.renderHeroBarChart\) window\.renderHeroBarChart\(\);/g;
const newRenderChartPattern = `setTimeout(() => { if (window.renderHeroBarChart) window.renderHeroBarChart(); }, 50);`;

scriptJs = scriptJs.replace(oldRenderChartPattern, newRenderChartPattern);

fs.writeFileSync('script.js', scriptJs);
console.log('Forced animations to play automatically');
