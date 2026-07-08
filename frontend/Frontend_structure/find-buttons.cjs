const fs = require('fs');
const path = require('path');

function findDeadButtons(dir) {
  let deadButtons = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      deadButtons = deadButtons.concat(findDeadButtons(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Match <button ... >
      const btnRegex = /<button([^>]*)>/g;
      let match;
      while ((match = btnRegex.exec(content)) !== null) {
        const attrs = match[1];
        if (!attrs.includes('onClick') && !attrs.includes('type=\"submit\"') && !attrs.includes('type=\'submit\'')) {
            deadButtons.push({ file: fullPath, buttonAttrs: attrs.trim() });
        }
      }
    }
  }
  return deadButtons;
}

const res = findDeadButtons('d:/lms/jawa/frontend/Frontend_structure/src/pages');
console.log('Dead buttons found:', res.length);
res.forEach(r => console.log(path.basename(r.file), r.buttonAttrs));
