"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const result = await prisma.$queryRaw `
    SELECT TABLE_NAME, TABLE_COMMENT 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'ai_atnd' AND TABLE_COMMENT != '';
  `;
    console.log('Table Comments:', result);
    const columnResult = await prisma.$queryRaw `
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_COMMENT 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'ai_atnd' AND TABLE_NAME = 'employees' AND COLUMN_COMMENT != '';
  `;
    console.log('Column Comments for employees:', columnResult);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
