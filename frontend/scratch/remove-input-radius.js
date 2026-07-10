import fs from 'fs';
import path from 'path';

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
    // Regex to match <Input ... radius="..." ...> and remove the radius prop
    let newContent = content.replace(/(<Input\b[^>]*?)\bradius="[a-z]+"/g, '$1');
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated:', filepath);
    }
  }
});
