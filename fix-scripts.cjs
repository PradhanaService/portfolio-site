const fs = require('fs');

// 1. Extract and format the work animation script from work.html
let workHtml = fs.readFileSync('work.html', 'utf8');

// Regex to capture the DOMContentLoaded block from work.html
const animScriptRegex = /document\.addEventListener\('DOMContentLoaded', \(\) => {([\s\S]*?const animContainer = document\.getElementById\('wf-hero-anim'\);[\s\S]*?observer\.observe\(animContainer, { attributes: true }\);\n\s*?})\);/g;

let workAnimBlock = '';
let match = animScriptRegex.exec(workHtml);
if (match) {
    workAnimBlock = match[1]; // The inside of the arrow function
    
    // Clean up work.html by removing the entire <script> block at the bottom
    workHtml = workHtml.replace(/<script>\s*\/\* Work Hero Folder Animation Orchestrator \*\/[\s\S]*?<\/script>\s*/, '');
    fs.writeFileSync('work.html', workHtml);
    console.log('Removed script block from work.html');
} else {
    console.log('Could not find anim block in work.html, might have already been removed.');
}

// 2. Add to script.js and update router logic
let scriptJs = fs.readFileSync('script.js', 'utf8');

if (workAnimBlock && !scriptJs.includes('window.initWorkAnim')) {
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

    scriptJs += initWorkAnimCode;
    console.log('Added window.initWorkAnim to script.js');
}

// 3. Update the SPA router inside script.js
const oldRouterPattern = /if \(href\.includes\('work\.html'\) && window\.loadWorkGrid\) {[\s\S]*?window\.initTimeline\(\);\s*}/;
const newRouterPattern = `if (href.includes('work.html')) {
        if (window.loadWorkGrid) window.loadWorkGrid();
        if (window.initWorkAnim) window.initWorkAnim();
      }
      if (href.includes('experience.html')) {
        if (window.initTimeline) window.initTimeline();
        if (window.renderHeroBarChart) window.renderHeroBarChart();
      }`;
      
if (scriptJs.match(oldRouterPattern)) {
    scriptJs = scriptJs.replace(oldRouterPattern, newRouterPattern);
    console.log('Updated SPA router logic');
}

// 4. Update initDataLoad in script.js
const oldInitDataLoadPattern = /function initDataLoad\(\) {[\s\S]*?window\.renderHeroBarChart\(\);\s*}/;
const newInitDataLoadPattern = `function initDataLoad() {
  if (window.location.pathname.includes('work.html')) {
    if (new URLSearchParams(window.location.search).has('project')) window.loadWorkDetail();
    else { window.loadWorkGrid(); if(window.initWorkAnim) window.initWorkAnim(); }
  } else if (window.location.pathname.includes('experience.html')) {
    if(window.renderHeroBarChart) window.renderHeroBarChart();
  }
}`;

if (scriptJs.match(oldInitDataLoadPattern)) {
    scriptJs = scriptJs.replace(oldInitDataLoadPattern, newInitDataLoadPattern);
    console.log('Updated initDataLoad logic');
}

fs.writeFileSync('script.js', scriptJs);
console.log('Successfully completed script updates!');
