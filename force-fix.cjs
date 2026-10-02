const fs = require('fs');

const initWorkAnimCode = `
window.initWorkAnim = function() {
  const animContainer = document.getElementById('wf-hero-anim');
  const folderBtn = document.getElementById('wf-folder-btn');
  if (!animContainer || !folderBtn) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const playAnimation = () => {
    if (prefersReduced) {
      animContainer.classList.add('wf-done');
      return;
    }
    animContainer.classList.remove('wf-play', 'wf-done');
    void animContainer.offsetWidth; // Force DOM reflow
    animContainer.classList.add('wf-play');
  };
  folderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playAnimation();
  });
  folderBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playAnimation();
    }
  });
  let hasTriggered = false;
  const triggerCheck = () => {
    if (hasTriggered) return;
    if (animContainer.classList.contains('visible') || isElementInViewport(animContainer)) {
      hasTriggered = true;
      playAnimation();
    }
  };
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
      rect.bottom >= 0
    );
  }
  triggerCheck();
  window.addEventListener('scroll', triggerCheck, { passive: true });
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (animContainer.classList.contains('visible') && !hasTriggered) {
          hasTriggered = true;
          playAnimation();
        }
      }
    });
  });
  observer.observe(animContainer, { attributes: true });
};
`;

let scriptJs = fs.readFileSync('script.js', 'utf8');

if (!scriptJs.includes('window.initWorkAnim')) {
    scriptJs += initWorkAnimCode;
    fs.writeFileSync('script.js', scriptJs);
    console.log('Added window.initWorkAnim to script.js');
} else {
    console.log('Already added window.initWorkAnim');
}

// Ensure the old script tag in work.html is completely stripped out!
let workHtml = fs.readFileSync('work.html', 'utf8');
const scriptToRemove = /<script>[\s\S]*?Work Hero Folder Animation Orchestrator[\s\S]*?<\/script>/;
workHtml = workHtml.replace(scriptToRemove, '');
fs.writeFileSync('work.html', workHtml);
console.log('Cleaned work.html script block');
