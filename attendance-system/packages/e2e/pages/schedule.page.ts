import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SchedulePage extends BasePage {
  readonly url = '/attendance/schedule';

  readonly deptTree: Locator;
  readonly calendar: Locator;
  readonly calendarCells: Locator;
  readonly calendarDataItems: Locator;

  constructor(page: Page) {
    super(page);
    this.deptTree = page.locator('ul.space-y-1'); // DepartmentTree container
    this.calendar = page.locator('.grid.grid-cols-7'); // Calendar body
    this.calendarCells = this.calendar.locator('.bg-white.p-1\\.5'); // Day cells
    this.calendarDataItems = this.calendar.locator('.bg-blue-50'); // Schedule data blocks
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
    // Wait for calendar to load (indicated by loading text or data appearing)
    await expect(this.page.locator('text=当前部门:')).toBeVisible();
  }

  /**
   * Check if a specific cell contains schedule data for an employee
   */
  async expectScheduleInCell(day: number, employeeName: string, shiftName: string) {
    // Find cell with the day number
    const cell = this.calendarCells.filter({ hasText: new RegExp(`^${day}$`, 'm') });
    await expect(cell).toBeVisible();
    
    // Check for employee/shift text inside that cell
    const dataItem = cell.locator('.bg-blue-50', { hasText: employeeName });
    await expect(dataItem).toBeVisible();
    await expect(dataItem).toContainText(shiftName);
  }
}
