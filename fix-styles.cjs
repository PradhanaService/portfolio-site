const fs = require('fs');

function extractAndMoveStyles(htmlFile, cssFile) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  const styleRegex = /<style>([\s\S]*?)<\/style>/g;
  
  let match;
  let allStyles = '';
  
  // Extract all style tags
  while ((match = styleRegex.exec(html)) !== null) {
    allStyles += match[1] + '\n';
  }
  
  if (allStyles.trim()) {
    // Append to styles.css
    fs.appendFileSync(cssFile, '\n/* Styles extracted from ' + htmlFile + ' */\n' + allStyles);
    
    // Remove from HTML
    html = html.replace(styleRegex, '');
    
    // Also remove the double </style> issue that was added by accident in experience.html
    html = html.replace(/<\/style>/g, '');
    html = html.replace(/@media \(prefers-reduced-motion: reduce\) {[\s\S]*?}/g, '');
    
    // But wait, removing ALL </style> is dangerous if there's legitimate ones, but we want NO inline styles.
    // Let's just do a clean pass.
  }
}

// Custom pass for experience.html because it's malformed
let expHtml = fs.readFileSync('experience.html', 'utf8');
const expStyleRegex = /<style>([\s\S]*?)<\/style>/;
let expMatch = expStyleRegex.exec(expHtml);
if (expMatch) {
    fs.appendFileSync('styles.css', '\n/* Styles extracted from experience.html */\n' + expMatch[1]);
}
// Remove from <style> down to </head> because it's malformed
expHtml = expHtml.replace(/<style>[\s\S]*?<\/head>/, '</head>');
fs.writeFileSync('experience.html', expHtml);


// Custom pass for work.html
let workHtml = fs.readFileSync('work.html', 'utf8');
const workStyleRegex = /<style>([\s\S]*?)<\/style>/;
let workMatch = workStyleRegex.exec(workHtml);
if (workMatch) {
    fs.appendFileSync('styles.css', '\n/* Styles extracted from work.html */\n' + workMatch[1]);
}
workHtml = workHtml.replace(/<style>[\s\S]*?<\/style>/, '');
fs.writeFileSync('work.html', workHtml);

console.log('Successfully moved styles!');
