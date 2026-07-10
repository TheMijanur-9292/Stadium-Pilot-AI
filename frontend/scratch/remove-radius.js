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
    // Replace radius="..." inside <Input ...>
    while (content.match(/<Input\b([\s\S]*?)radius="[a-z]+"/)) {
      content = content.replace(/<Input\b([\s\S]*?)radius="[a-z]+"/, '<Input$1');
    }
    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Updated:', filepath);
    }
  }
});
