const fs = require('fs');

const initWorkAnimCode = `
window.initWorkAnim = function() {
  const animContainer = document.getElementById('wf-hero-anim');
  const folderBtn = document.getElementById('wf-folder-btn');
  if (!animContainer || !folderBtn) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const playAnimation = (isInitial = false) => {
    if (prefersReduced) {
      animContainer.classList.add('wf-done');
      return;
    }
    animContainer.classList.remove('wf-play', 'wf-done');
    void animContainer.offsetWidth; // Force DOM reflow
    animContainer.classList.add('wf-play');
    
    if (isInitial) {
      setTimeout(() => {
        const grid = document.getElementById('dynamic-work-grid');
        if (grid) {
          const y = grid.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 2100);
    }
  };
  
  folderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playAnimation(false);
  });
  
  folderBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playAnimation(false);
    }
  });

  // Always forcefully trigger the animation sequence after a tiny delay
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Automatically scroll down only on the initial page load trigger
        playAnimation(true); 
      });
    });
  }, 100);
};
`;

let scriptJs = fs.readFileSync('script.js', 'utf8');

// Replace the existing initWorkAnim function entirely
const existingPattern = /window\.initWorkAnim = function\(\) \{[\s\S]*?\n\};\n?$/m;
if (scriptJs.match(existingPattern)) {
    scriptJs = scriptJs.replace(existingPattern, initWorkAnimCode);
    fs.writeFileSync('script.js', scriptJs);
    console.log('Replaced existing initWorkAnim');
} else {
    console.log('Could not find existing initWorkAnim to replace');
}
