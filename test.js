const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('DaidoSim/index.html', 'utf8');

const dom = new JSDOM(html);
const document = dom.window.document;

// Basic sanity check to ensure no syntax errors and rendering issues in static DOM setup
const hasTaskList = document.getElementById('tasklist') !== null;
console.log('Has tasklist:', hasTaskList);

if (!hasTaskList) {
  process.exit(1);
}
