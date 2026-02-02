const fs = require('fs');
const path = require('path');

const FEATURES_DIR = 'docs/features';
const REQUIRED_FILES = ['requirements.md', 'design.md', 'tasks.md'];

function lintDocs() {
  const errors = [];
  const featuresPath = path.resolve(__dirname, '..', FEATURES_DIR);
  
  if (!fs.existsSync(featuresPath)) {
    console.error(`Features directory not found: ${featuresPath}`);
    process.exit(1);
  }

  const dirs = fs.readdirSync(featuresPath, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of dirs) {
    // Only check directories matching SPEC ID format (e.g., SW62, UA1) or just all directories?
    // The plan didn't specify regex filter, but previous script did.
    // Let's stick to the plan's logic: check all directories in features/
    
    const dirPath = path.join(featuresPath, dir.name);
    const files = fs.readdirSync(dirPath);

    // Check required files
    for (const required of REQUIRED_FILES) {
      if (!files.includes(required)) {
        errors.push(`[${dir.name}] 缺少必需文件: ${required}`);
      }
    }

    // Check filenames (no Chinese)
    for (const file of files) {
      if (/[\u4e00-\u9fa5]/.test(file)) {
        errors.push(`[${dir.name}] 文件名包含中文: ${file}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('文档检查失败:\n' + errors.map(e => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log('✅ 文档检查通过');
}

lintDocs();
