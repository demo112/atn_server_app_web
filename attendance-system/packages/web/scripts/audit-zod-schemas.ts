import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '../src');
const reportPath = path.resolve(__dirname, '../../../../docs/e2e/reports/web-schema-gaps.md');

interface Gap {
  file: string;
  line: number;
  content: string;
}

const gaps: Gap[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Simple regex to find z.string() usage
  // This is not a full AST parser, so it might have false positives/negatives
  // It looks for 'z.string()' that is NOT followed by '.max(' in the same line or context
  
  // Strategy: Find lines with 'z.string()'
  // Check if '.max(' is missing in that line
  // Limitation: Multi-line chaining is hard to detect with line-by-line regex
  
  lines.forEach((line, index) => {
    if (line.includes('z.string()') && !line.includes('.max(')) {
       // Filter out common false positives like 'z.string().optional()' if it's the end of chain? No, optional doesn't limit length.
       // Filter out 'z.string().email()' ? Email has implicit limit but usually we want explicit max too.
       // Filter out 'z.string().url()'?
       
       // Just record it for manual review
       gaps.push({
         file: path.relative(srcDir, filePath),
         line: index + 1,
         content: line.trim(),
       });
    }
  });
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  }
}

// Ensure report dir exists
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('Scanning for Zod schema gaps in', srcDir);
walkDir(srcDir);

let reportContent = `# Web Zod Schema Gap Analysis Report\n`;
reportContent += `Generated at: ${new Date().toISOString()}\n\n`;
reportContent += `## Summary\n`;
reportContent += `Total Potential Gaps Found: ${gaps.length}\n\n`;
reportContent += `## Details\n`;
reportContent += `The following locations use \`z.string()\` without an explicit \`.max()\` constraint on the same line.\n\n`;

if (gaps.length === 0) {
  reportContent += `No gaps found!\n`;
} else {
  reportContent += `| File | Line | Content |\n`;
  reportContent += `|------|------|---------|\n`;
  gaps.forEach(gap => {
    reportContent += `| ${gap.file} | ${gap.line} | \`${gap.content.replace(/`/g, '')}\` |\n`;
  });
}

fs.writeFileSync(reportPath, reportContent);
console.log(`Report generated at ${reportPath}`);
