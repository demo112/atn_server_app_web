import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ToastComponent } from '../components/toast.component';
import dayjs from 'dayjs';

export class SchedulePage extends BasePage {
  readonly url = '/attendance/schedule';

  readonly toast: ToastComponent;
  readonly deptTree: Locator;
  readonly calendar: Locator;
  readonly calendarCells: Locator;
  readonly calendarHeader: Locator;
  readonly prevMonthBtn: Locator;
  readonly nextMonthBtn: Locator;
  
  // Buttons
  readonly createBtn: Locator;
  readonly batchCreateBtn: Locator;

  // Dialogs
  readonly dialog: Locator;
  readonly dialogSubmitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.toast = new ToastComponent(page);
    this.deptTree = page.locator('ul.space-y-1');
    this.calendar = page.locator('.grid.grid-cols-7');
    this.calendarCells = this.calendar.locator('.bg-white.p-1\\.5');
    this.calendarHeader = page.locator('.text-lg.font-bold.text-gray-800'); // "2026年 2月"
    this.prevMonthBtn = page.getByRole('button', { name: '< 上个月' });
    this.nextMonthBtn = page.getByRole('button', { name: '下个月 >' });

    this.createBtn = page.getByRole('button', { name: '+ 新建排班' });
    this.batchCreateBtn = page.getByRole('button', { name: '批量排班' });
    
    this.dialog = page.getByRole('dialog');
    this.dialogSubmitBtn = this.dialog.getByRole('button', { name: /提交/ });
  }

  /**
   * Get a department node by its name
   */
  getDeptNode(name: string) {
    return this.page.locator('span.truncate', { hasText: name });
  }

  /**
   * Select a department from the tree
   */
  async selectDept(name: string) {
    const node = this.getDeptNode(name);
    await expect(node).toBeVisible();
    await node.click();
    
    // Wait for calendar to be visible (it means a dept is selected)
    // The calendar component renders when deptId is truthy
    await expect(this.calendar).toBeVisible();
    
    // Wait for loading to finish (if any)
    await expect(this.page.locator('text=Loading...')).not.toBeVisible();
  }

  /**
   * Navigate calendar to specific month
   */
  async navigateToMonth(dateStr: string) {
    const targetDate = dayjs(dateStr);
    const targetYear = targetDate.year();
    const targetMonth = targetDate.month(); // 0-11

    // Get current calendar month
    // Header format: "2026年 2月"
    const headerText = await this.calendarHeader.textContent();
    if (!headerText) throw new Error('Cannot read calendar header');
    
    const [yearStr, monthStr] = headerText.replace('年', '').replace('月', '').split(' ');
    let currentYear = parseInt(yearStr.trim());
    let currentMonth = parseInt(monthStr.trim()) - 1; // Convert to 0-11

    // Limit iterations to avoid infinite loop
    let maxIterations = 24; 
    while ((currentYear !== targetYear || currentMonth !== targetMonth) && maxIterations > 0) {
      if (currentYear < targetYear || (currentYear === targetYear && currentMonth < targetMonth)) {
        await this.nextMonthBtn.click();
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
      } else {
        await this.prevMonthBtn.click();
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
      }
      
      // Wait for update
      await this.page.waitForTimeout(200); // Small wait for React state update
      maxIterations--;
    }
    
    if (maxIterations === 0) {
        throw new Error(`Failed to navigate to ${dateStr}`);
    }
  }

  /**
   * Filter/Show calendar for date range
   * Actually navigates to the start date's month
   */
  async filterByDate(startDate: string, endDate: string) {
      await this.navigateToMonth(startDate);
  }

  /**
   * Open Create Schedule Dialog
   */
  async openCreateDialog() {
    await this.createBtn.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.dialog).toContainText('新建排班');
  }

  /**
   * Open Batch Schedule Dialog
   */
  async openBatchDialog() {
    await this.batchCreateBtn.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.dialog).toContainText('批量排班');
  }

  /**
   * High-level create method (CRUD style)
   */
  async create(data: {
    employeeName?: string;
    shiftName: string;
    startDate: string;
    endDate: string;
    force?: boolean;
  }) {
    await this.openCreateDialog();
    await this.fillCreateForm(data);
    await this.submitDialog();
  }

  /**
   * Fill Create Schedule Form
   */
  async fillCreateForm(data: {
    employeeName?: string; 
    shiftName: string;
    startDate: string;
    endDate: string;
    force?: boolean;
  }) {
    if (data.employeeName) {
      const select = this.dialog.getByLabel('选择员工');
      // Wait for options to populate (async fetch)
      // Expect at least one option with value (excluding placeholder if possible, or just wait for specific option)
      try {
        const option = select.locator('option').filter({ hasText: data.employeeName }).first();
        await expect(option).toBeAttached({ timeout: 10000 });
      } catch (e) {
        const options = await select.locator('option').allInnerTexts();
        console.log(`[Debug] Failed to find employee "${data.employeeName}". Available options:`, options);
        throw e;
      }
      const option = select.locator('option').filter({ hasText: data.employeeName }).first();
      const value = await option.getAttribute('value');
      if (!value) {
        throw new Error(`Employee option containing "${data.employeeName}" not found`);
      }
      await select.selectOption(value);
    }

    // Shift select
    const shiftSelect = this.dialog.getByLabel('选择班次');
    try {
      const shiftOption = shiftSelect.locator('option').filter({ hasText: data.shiftName }).first();
      await expect(shiftOption).toBeAttached({ timeout: 10000 });
    } catch (e) {
      const options = await shiftSelect.locator('option').allInnerTexts();
      const msg = `[Debug] Failed to find shift "${data.shiftName}". Available options: ${JSON.stringify(options)}`;
      console.log(msg);
      throw new Error(msg + "\nOriginal Error: " + (e instanceof Error ? e.message : String(e)));
    }
    const shiftOption = shiftSelect.locator('option').filter({ hasText: data.shiftName }).first();
    const shiftValue = await shiftOption.getAttribute('value');
    if (!shiftValue) {
      throw new Error(`Shift option "${data.shiftName}" not found`);
    }
    await shiftSelect.selectOption(shiftValue);

    await this.dialog.getByLabel('开始日期').fill(data.startDate);
    await this.dialog.getByLabel('结束日期').fill(data.endDate);

    if (data.force) {
      await this.dialog.getByLabel('强制覆盖').check();
    } else {
      await this.dialog.getByLabel('强制覆盖').uncheck();
    }
  }

  /**
   * Fill Batch Schedule Form
   */
  async fillBatchForm(data: {
    shiftName: string;
    startDate: string;
    endDate: string;
    force?: boolean;
    includeSub?: boolean;
  }) {
    // Batch dialog only has Shift select
    const shiftSelect = this.dialog.getByLabel('选择班次');
    try {
      const shiftOption = shiftSelect.locator('option').filter({ hasText: data.shiftName }).first();
      await expect(shiftOption).toBeAttached({ timeout: 10000 });
    } catch (e) {
      const options = await shiftSelect.locator('option').allInnerTexts();
      const msg = `[Debug] Failed to find shift "${data.shiftName}". Available options: ${JSON.stringify(options)}`;
      console.log(msg);
      throw new Error(msg + "\nOriginal Error: " + (e instanceof Error ? e.message : String(e)));
    }
    const shiftOption = shiftSelect.locator('option').filter({ hasText: data.shiftName }).first();
    const shiftValue = await shiftOption.getAttribute('value');
    if (!shiftValue) {
      throw new Error(`Shift option "${data.shiftName}" not found`);
    }
    await shiftSelect.selectOption(shiftValue);

    await this.dialog.getByLabel('开始日期').fill(data.startDate);
    await this.dialog.getByLabel('结束日期').fill(data.endDate);

    if (data.force) {
      await this.dialog.getByLabel('强制覆盖').check();
    }
    if (data.includeSub) {
      await this.dialog.getByLabel('包含子部门').check();
    }
  }

  async submitDialog() {
    await this.dialogSubmitBtn.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Check if a specific cell contains schedule data for an employee
   */
  async expectScheduleInCell(day: number, employeeName: string, shiftName: string) {
    // Find cell with the day number
    // We need to match exact number in .font-bold
    const cell = this.calendarCells.filter({ hasText: String(day) }).first();
    await expect(cell).toBeVisible();
    
    // Check for employee/shift text inside that cell
    const dataItem = cell.locator('.bg-blue-50').filter({ hasText: employeeName });
    await expect(dataItem).toBeVisible();
    await expect(dataItem).toContainText(shiftName);
  }
}
