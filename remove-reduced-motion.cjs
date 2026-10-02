const fs = require('fs');

// 1. Remove prefersReduced logic from script.js
let scriptJs = fs.readFileSync('script.js', 'utf8');

scriptJs = scriptJs.replace(/const prefersReduced = window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches;\s*/g, '');
scriptJs = scriptJs.replace(/if \(prefersReduced\) \{\s*animContainer\.classList\.add\('wf-done'\);\s*return;\s*\}/g, '');

fs.writeFileSync('script.js', scriptJs);
console.log('Removed reduced-motion logic from script.js');

// 2. Remove prefers-reduced-motion media queries from styles.css
let stylesCss = fs.readFileSync('styles.css', 'utf8');

// The work.html animation media query block
const animMediaQueryRegex = /\/\* Step 5 & Accessibility: prefers-reduced-motion \*\/[\s\S]*?@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\}\s*\}\s*@media \(max-width/g;
stylesCss = stylesCss.replace(animMediaQueryRegex, '@media (max-width');

// The generic reduced motion block at the top
const genericMediaQueryRegex = /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\}\s*\}/g;
stylesCss = stylesCss.replace(genericMediaQueryRegex, '');

fs.writeFileSync('styles.css', stylesCss);
console.log('Removed reduced-motion media queries from styles.css');
