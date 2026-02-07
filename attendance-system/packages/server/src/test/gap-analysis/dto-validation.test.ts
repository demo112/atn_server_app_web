import request from 'supertest';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { prisma } from '../../common/db/prisma';
import { resources } from './resource-config';
import fs from 'fs';
import path from 'path';
import './setup';

// Path relative to execution context usually
// packages/server/src/test/gap-analysis
const reportPath = path.resolve(__dirname, '../../../../../docs/e2e/reports/server-dto-gaps.md');
const failures: string[] = [];

describe('DTO Validation Gap Analysis', () => {
  let app: any;
  const prismaMock = prisma as any;

  beforeAll(async () => {
    // Dynamic import to ensure mocks in setup.ts are applied before app is loaded
    const mod = await import('../../app');
    app = mod.app;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Generate Report
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    let content = `# Server DTO Validation Gap Analysis Report\n`;
    content += `Generated at: ${new Date().toISOString()}\n\n`;
    content += `## Summary\n`;
    content += `Total Gaps Found: ${failures.length}\n\n`;
    content += `## Details\n`;

    if (failures.length === 0) {
      content += `No gaps found! All checked fields enforce length limits.\n`;
    } else {
      failures.forEach(fail => {
        content += `- [ ] ${fail}\n`;
      });
    }

    fs.writeFileSync(reportPath, content);
    console.log(`Gap analysis report written to ${reportPath}`);
  });

  resources.forEach(resource => {
    if (!resource.createPayload || !resource.stringFields) return;

    describe(`'${resource.name}' Resource`, () => {
      
      resource.stringFields.forEach(field => {
        it(`should reject POST ${resource.endpoint} with overly long ${field}`, async () => {
          // Setup mock
           if (!prismaMock[resource.modelName]) {
               prismaMock[resource.modelName] = {
                   create: vi.fn(),
               };
            } else {
                if (!prismaMock[resource.modelName].create) prismaMock[resource.modelName].create = vi.fn();
            }
            if (typeof prismaMock[resource.modelName].create.mockResolvedValue !== 'function') {
                prismaMock[resource.modelName].create = vi.fn();
            }
          prismaMock[resource.modelName].create.mockResolvedValue(resource.mockEntity);

          // Create payload with long string
          const payload = { ...resource.createPayload };
          payload[field] = 'a'.repeat(300); // 300 chars, assuming max is usually 255 or less

          const res = await request(app)
            .post(resource.endpoint)
            .send(payload);

          if (res.status !== 400) {
            const msg = `${resource.name}: POST ${resource.endpoint} accepted ${field} with 300 chars (Status: ${res.status})`;
            failures.push(msg);
            // We don't fail the test execution, just record the gap
            // expect(res.status).toBe(400); 
          } else {
             // Optional: check if error message relates to length
             // But 400 is good enough for now
          }
        });
      });

    });
  });
});
