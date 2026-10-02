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

  // Always forcefully trigger the animation sequence after a tiny delay
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        playAnimation();
      });
    });
  }, 100);
};
`;

let scriptJs = fs.readFileSync('script.js', 'utf8');

if (!scriptJs.includes('window.initWorkAnim = function')) {
    scriptJs += initWorkAnimCode;
    fs.writeFileSync('script.js', scriptJs);
    console.log('Successfully appended initWorkAnim definition!');
} else {
    console.log('Definition already exists');
}
