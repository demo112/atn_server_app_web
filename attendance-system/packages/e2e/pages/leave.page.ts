import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent } from '../components/table.component';
import { ModalComponent } from '../components/modal.component';

export class LeavePage extends BasePage {
  readonly url = '/attendance/leave';
  readonly table: TableComponent;
  readonly modal: ModalComponent;
  
  readonly createButton: Locator;
  readonly employeeInput: Locator;
  readonly selectUserConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.modal = new ModalComponent(page);
    
    this.createButton = page.getByRole('button', { name: '申请请假' });
    this.employeeInput = page.getByPlaceholder('请选择员工');
    this.selectUserConfirmButton = page.getByRole('button', { name: '确定' }).last(); // Usually the second 'confirm' in nested modals
  }

  async openCreateDialog() {
    await this.createButton.click();
    await expect(this.getModal().getByText('申请请假')).toBeVisible();
  }

  async selectEmployee(deptName: string, empName: string) {
    // The input is readonly and wrapped in a div that handles the click.
    // We use force: true to ensure the click is registered even if the input is not interactive.
    await this.employeeInput.click({ force: true });
    const selectModal = this.page.getByRole('dialog').filter({ hasText: '选择人员' });
    await expect(selectModal).toBeVisible();
    
    // Select Dept (assuming tree structure or list)
    // Wait for dept to appear
    await selectModal.getByText(deptName, { exact: false }).waitFor();
    await selectModal.getByText(deptName, { exact: false }).click();
    
    // Select Employee
    // Wait for employee list to load
    await selectModal.getByText(empName).waitFor();
    await selectModal.getByText(empName).click();
    
    // Confirm selection
    // Note: The generic modal component might find the wrong 'confirm' if multiple modals are open
    // So we use a specific locator for the selection modal
    await this.selectUserConfirmButton.click();
  }

  async fillLeaveForm(data: { type: string; startTime: string; endTime: string; reason: string }) {
    const modal = this.getModal().filter({ hasText: '申请请假' });
    
    // Select Type
    await modal.locator('select').selectOption({ label: data.type });

    // Time
    // Label is not associated with input via for/id, so we use layout-based location
    await modal.locator('div').filter({ hasText: /^开始时间/ }).locator('input').fill(data.startTime);
    await modal.locator('div').filter({ hasText: /^结束时间/ }).locator('input').fill(data.endTime);
    
    // Reason
    await modal.getByPlaceholder('请输入请假/出差事由').fill(data.reason);
  }

  async submit() {
    const modal = this.getModal().filter({ hasText: '申请请假' });
    await modal.getByRole('button', { name: '确定' }).click();
  }

  async expectToast(message: string) {
    await expect(this.getToast()).toContainText(message);
  }

  async expectRecord(employeeName: string, status: string) {
    const row = this.table.findRowByText(employeeName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(status);
  }

  async cancelLeave(employeeName: string) {
    await this.table.clickRowAction(employeeName, '撤销');
    // Confirm dialog
    const confirmDialog = this.page.getByRole('dialog').filter({ hasText: '确认撤销' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: '确定' }).click();
  }
}
