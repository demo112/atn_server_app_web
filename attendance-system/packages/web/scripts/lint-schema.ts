
import fs from 'fs';
import path from 'path';

// Configuration
const SCAN_DIR = path.resolve(__dirname, '../src');
const EXCLUDE_EXTS = ['.test.ts', '.spec.ts'];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules') {
        getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function main() {
  console.log('🔍 Starting Schema Security Audit...');
  
  // Find files
  const allFiles = getAllFiles(SCAN_DIR);
  const files = allFiles.filter(f => 
    (f.endsWith('.ts') || f.endsWith('.tsx')) && 
    !EXCLUDE_EXTS.some(ext => f.endsWith(ext))
  );

  console.log(`📂 Found ${files.length} files to scan.`);

  let errorCount = 0;
  let fileCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Skip files without Zod
    if (!content.includes('z.string')) continue;

    fileCount++;
    const lines = content.split('\n');
    
    // Simple heuristic: 
    // Find lines with z.string()
    // Check if the same statement chain has .max()
    // This is a naive implementation but catches 80% of cases.
    
    // Better Regex:
    // Match z.string() ... until end of expression (comma, semicolon, newline if not chained)
    
    // Let's iterate lines for reporting
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('z.string()')) {
        // Check if .max() is present in this line or subsequent lines if chained
        // We'll look at a window of lines to handle formatting
        const contextWindow = lines.slice(i, i + 10).join('\n');
        // Find the end of the zod chain (comma or semicolon or closing brace of object)
        // This is hard with regex. 
        
        // Simplified check: Just warn if a file has z.string() but fewer .max() calls? No.
        
        // Let's check the immediate line first
        if (!line.includes('.max(')) {
             // Check next few lines for chained calls
             let hasMax = false;
             let j = 1;
             while (i + j < lines.length && j < 5) {
                 const nextLine = lines[i+j];
                 if (nextLine.trim().startsWith('.')) {
                     if (nextLine.includes('.max(')) {
                         hasMax = true;
                         break;
                     }
                 } else {
                     break; // Chain broken
                 }
                 j++;
             }
             
             if (!hasMax) {
                 console.error(`❌ [GAP] Missing .max() constraint in ${path.relative(SCAN_DIR, file)}:${i + 1}`);
                 console.error(`   Line: ${line.trim()}`);
                 errorCount++;
             }
        }
      }
    }
  }

  console.log('\n📊 Audit Summary:');
  console.log(`   Scanned Files with Zod: ${fileCount}`);
  console.log(`   Potential Gaps Found: ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Security Gaps Detected! Please add .max() to all z.string() fields.');
    process.exit(1); // Fail the build/check
  } else {
    console.log('\n✅ All checks passed!');
  }
}

main().catch(console.error);
