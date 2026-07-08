const fs = require('fs');
const path = require('path');

function patchDeadButtons(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += patchDeadButtons(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      let modified = false;
      const newContent = content.replace(/<button([^>]*)>/g, (match, attrs) => {
        if (!attrs.includes('onClick') && !attrs.includes('type=\"submit\"') && !attrs.includes('type=\'submit\'')) {
          modified = true;
          // check if there's already a space after button
          return `<button onClick={() => alert('Feature coming soon!')}${attrs}>`;
        }
        return match;
      });

      if (modified) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        count++;
      }
    }
  }
  return count;
}

const count = patchDeadButtons('d:/lms/jawa/frontend/Frontend_structure/src/pages');
console.log(`Patched ${count} files.`);
