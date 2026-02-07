import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '../src');
const reportPath = path.resolve(__dirname, '../../../../docs/e2e/reports/app-navigation-gaps.md');

interface Gap {
  file: string;
  line: number;
  content: string;
}

const gaps: Gap[] = [];

// Regex to find unsafe param usage
// 1. route.params.something (direct access without validation)
// 2. const { something } = route.params (destructuring without validation)
// 3. useRoute<RouteProp<...>>() (usage of generic RouteProp is okay, but we want to see if they use Zod to validate params at runtime)
// Actually, static analysis of "did they validate params" is hard.
// Let's look for `route.params` usage and see if there is any `Schema.parse` or similar nearby? Too complex.

// Simpler approach:
// Find all files using `route.params` or `useRoute`.
// Flag them as "Potential unsafe param access" if they don't seem to import a specific schema file or Zod.

// Better approach for "Gap Analysis":
// Just list all usages of `route.params` so human can review if they are safe.
// And list if they use `as` casting which bypasses type safety.

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for route.params access
    if (line.includes('route.params')) {
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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      scanFile(fullPath);
    }
  }
}

// Ensure report dir exists
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log('Scanning for Navigation Param gaps in', srcDir);
walkDir(srcDir);

let reportContent = `# App Navigation Security Gap Analysis Report\n`;
reportContent += `Generated at: ${new Date().toISOString()}\n\n`;
reportContent += `## Summary\n`;
reportContent += `Total usages of \`route.params\` found: ${gaps.length}\n`;
reportContent += `\n> Note: These are locations where navigation parameters are accessed. Review them to ensure runtime validation (e.g. using Zod) is performed before using the data.\n\n`;
reportContent += `## Details\n`;

if (gaps.length === 0) {
  reportContent += `No usage of \`route.params\` found (or handled via other means).\n`;
} else {
  reportContent += `| File | Line | Content |\n`;
  reportContent += `|------|------|---------|\n`;
  gaps.forEach(gap => {
    reportContent += `| ${gap.file} | ${gap.line} | \`${gap.content.replace(/`/g, '')}\` |\n`;
  });
}

fs.writeFileSync(reportPath, reportContent);
console.log(`Report generated at ${reportPath}`);
