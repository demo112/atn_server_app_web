import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DailyRecordsPage extends BasePage {
  readonly url = '/attendance/daily-records';

  // Filters
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly employeeNameInput: Locator;
  readonly deptIdInput: Locator; // Assuming there is an input for deptId based on state
  readonly statusSelect: Locator; // Assuming select
  readonly searchBtn: Locator;
  readonly resetBtn: Locator;

  // Header Actions
  readonly recalculateBtn: Locator;

  // Table
  readonly table: Locator;
  readonly tableRows: Locator;

  // Recalculate Modal
  readonly recalcModal: Locator;
  readonly recalcStartDateInput: Locator;
  readonly recalcEndDateInput: Locator;
  readonly recalcEmployeeIdsInput: Locator;
  readonly recalcConfirmBtn: Locator;
  readonly recalcCancelBtn: Locator;

  constructor(page: Page) {
    super(page);
    
    // Filters
    // Based on the code, these are inside a form.
    // Inputs are likely identifiable by label or placeholder if labels are ambiguous.
    // The React code uses labels: "开始日期", "结束日期", "员工姓名"
    // deptId and status are not fully visible in snippet but likely exist.
    
    // Using layout structure for more precision if needed, but labels are good.
    this.startDateInput = page.locator('input[type="date"]').first(); // First date input
    this.endDateInput = page.locator('input[type="date"]').nth(1);    // Second date input
    
    // For text inputs, using placeholders or labels
    // Assuming structure: label + input
    this.employeeNameInput = page.getByRole('textbox').filter({ hasText: '' }).nth(0); // This is risky. 
    // Let's use getByLabel if possible, or implementation specific selectors.
    // React code: <label>员工姓名</label><input ... />
    // Playwright's getByLabel works if there is a 'for' attribute or nesting. 
    // The snippet shows nesting: <div class="flex flex-col"><label>...</label><input></div>
    // So getByLabel might not work directly unless 'for' is set. 
    // Let's use generic locators relative to labels or placeholders if available.
    // Looking at the snippet: <input className="..." /> no placeholder shown in snippet for dates, 
    // but maybe for name.
    
    // Fallback to CSS for now to be safe with the snippet provided
    // .grid > div:nth-child(3) -> Name (if admin)
    
    // Better strategy:
    this.employeeNameInput = page.locator('input').filter({ hasNot: page.locator('[type="date"]') }).first(); 
    // Actually, let's wait to see full code or use a loose selector. 
    // The snippet has: <label>员工姓名</label><input ... />
    // I can select the input that follows the label "员工姓名"
    this.employeeNameInput = page.locator('div').filter({ hasText: '员工姓名' }).locator('input');
    
    this.deptIdInput = page.locator('div').filter({ hasText: '部门ID' }).locator('input'); // Guessing label
    this.statusSelect = page.locator('select'); // Guessing it's a select
    
    this.searchBtn = page.getByRole('button', { name: '查询' });
    this.resetBtn = page.getByRole('button', { name: '重置' });

    // Actions
    this.recalculateBtn = page.getByRole('button', { name: '手动重算' });

    // Table
    this.table = page.locator('table');
    this.tableRows = this.table.locator('tbody tr');

    // Modal
    this.recalcModal = page.getByRole('dialog');
    this.recalcStartDateInput = this.recalcModal.locator('input[type="date"]').first();
    this.recalcEndDateInput = this.recalcModal.locator('input[type="date"]').nth(1);
    this.recalcEmployeeIdsInput = this.recalcModal.locator('input[placeholder*="ID"]'); // Guessing placeholder
    // Or just input that is not date
    // this.recalcEmployeeIdsInput = this.recalcModal.locator('input:not([type="date"])');
    
    this.recalcConfirmBtn = this.recalcModal.getByRole('button', { name: '开始重算' });
    this.recalcCancelBtn = this.recalcModal.getByRole('button', { name: '取消' });
  }

  async triggerRecalculate(startDate: string, endDate: string, employeeIds?: string) {
    await this.recalculateBtn.click();
    await expect(this.recalcModal).toBeVisible();
    await this.recalcStartDateInput.fill(startDate);
    await this.recalcEndDateInput.fill(endDate);
    if (employeeIds) {
        // Find the input for IDs. It might be a textarea or input.
        // Assuming it's the 3rd input in the modal
        const inputs = this.recalcModal.locator('input, textarea');
        // 0: start, 1: end, 2: ids
        await inputs.nth(2).fill(employeeIds);
    }
    await this.recalcConfirmBtn.click();
  }

  async search(name?: string, startDate?: string, endDate?: string) {
    if (startDate) await this.startDateInput.fill(startDate);
    if (endDate) await this.endDateInput.fill(endDate);
    if (name) await this.employeeNameInput.fill(name);
    await this.searchBtn.click();
    // Wait for loading to finish? 
    // The page has a loading state. We can wait for a network idle or a specific element.
    await this.page.waitForTimeout(500); // Simple wait for demo
  }
}
