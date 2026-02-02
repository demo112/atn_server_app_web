const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs/features');
const REQUIRED_FILES = ['requirements.md', 'design.md', 'tasks.md'];

function checkFeatureDocs() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.log('Skipping docs lint: features directory not found');
    return;
  }

  const features = fs.readdirSync(DOCS_DIR).filter(f => /^[A-Z]{2}\d+$/.test(f));
  let hasError = false;

  features.forEach(feature => {
    const featureDir = path.join(DOCS_DIR, feature);
    REQUIRED_FILES.forEach(file => {
      if (!fs.existsSync(path.join(featureDir, file))) {
        console.error(`[ERROR] Missing file in ${feature}: ${file}`);
        hasError = true;
      }
    });
  });

  if (hasError) {
    process.exit(1);
  }
  console.log('Docs structure verification passed.');
}

checkFeatureDocs();
