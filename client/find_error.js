const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('npx eslint "src/**/*.{js,jsx}" -f json');
} catch(e) {
  const errs = JSON.parse(e.stdout.toString());
  let output = "";
  errs.forEach(f => {
    f.messages.forEach(m => {
      if(m.message.includes('user')) {
        output += `${f.filePath}:${m.line}:${m.column} - ${m.message}\n`;
      }
    });
  });
  fs.writeFileSync('errors.txt', output);
}
