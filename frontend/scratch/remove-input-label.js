const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(filepath, callback);
      }
    } else if (file.endsWith('.tsx')) {
      callback(filepath);
    }
  });
}

walk('src', (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  if (content.includes('<Input')) {
    let original = content;
    // Regex to match <Input ... label="..." ...> and extract it into a separate label element
    // Loop to handle files with multiple inputs
    let updated = true;
    while (updated) {
      let nextContent = content.replace(/<Input\b([^>]*?)label="([^"]+)"([^>]*?>)/, (match, before, labelText, after) => {
        return `<label className="block text-xs font-semibold text-default-600 mb-1">${labelText}</label>\n<Input${before}${after}`;
      });
      if (nextContent === content) {
        updated = false;
      } else {
        content = nextContent;
      }
    }

    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Updated:', filepath);
    }
  }
});
