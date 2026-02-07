
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '../src');
const EXCLUDE_EXTS = ['.test.tsx', '.test.ts', '.spec.tsx', '.spec.ts'];

let errorCount = 0;

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for route.params access
    if (line.includes('route.params')) {
       // Simple heuristic: Is it being validated?
       // Look for '.parse(' or 'Schema' in the same line
       const isValidated = line.includes('.parse(') || line.includes('Schema');
       
       if (!isValidated) {
         console.error(`❌ [GAP] Unsafe route.params access in ${path.relative(srcDir, filePath)}:${index + 1}`);
         console.error(`   Line: ${line.trim()}`);
         errorCount++;
       }
    }
  });
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
        if (file !== 'node_modules') {
            walkDir(fullPath);
        }
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !EXCLUDE_EXTS.some(ext => file.endsWith(ext))) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Starting App Navigation Security Audit...');
walkDir(srcDir);

console.log(`\n📊 Audit Summary:`);
console.log(`   Potential Unsafe Nav Params: ${errorCount}`);

if (errorCount > 0) {
  console.log('\n⚠️  Security Gaps Detected! Ensure route.params are validated with Zod before use.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed!');
}
