import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ModalComponent } from '../components/modal.component';

/**
 * Helper for the custom Department/Employee modal which doesn't use StandardModal
 * and lacks role="dialog".
 */
class CustomModal {
  readonly root: Locator;
  
  constructor(private page: Page) {
    // Select the modal container by its specific class structure
    // We look for the fixed overlay that contains the white modal box
    this.root = page.locator('.fixed.inset-0.z-50').filter({ has: page.locator('.bg-white.rounded-lg') });
  }

  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async waitForClose(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }

  async fillField(label: string, value: string): Promise<void> {
    // DepartmentModal uses labelled inputs
    await this.root.locator('input').filter({ hasText: value }).first().fill(value); // Fallback? 
    // Actually, DepartmentModal has explicit labels.
    // EmployeeModal also has labels.
    // We can try getByLabel but scoped to root.
    // Since root covers the whole screen, we need to be careful.
    // The inner .bg-white box is the actual modal content.
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.getByPlaceholder(label).or(content.getByLabel(label)).fill(value);
  }

  async fillByName(placeholder: string, value: string): Promise<void> {
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.getByPlaceholder(placeholder).fill(value);
  }

  async confirm(): Promise<void> {
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.getByRole('button', { name: /确定|保存/ }).click();
  }
  
  async close(): Promise<void> {
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.getByRole('button', { name: '取消' }).click();
  }
}

export class EmployeePage extends BasePage {
  readonly url = '/employees';
  readonly standardModal: ModalComponent;
  readonly customModal: CustomModal;

  constructor(page: Page) {
    super(page);
    this.standardModal = new ModalComponent(page);
    this.customModal = new CustomModal(page);
  }

  // --- Department Tree Actions ---

  private getDepartmentNode(name: string): Locator {
    // Matches the row container (.group) that contains the exact text of the department name
    // The .group element contains the buttons and the name span, but NOT the children tree nodes
    return this.page.locator('.group').filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async selectDepartment(name: string): Promise<void> {
    const node = this.getDepartmentNode(name);
    await node.click();
  }

  async addDepartment(parentName: string | null, newName: string): Promise<void> {
    if (parentName) {
      // Add sub-department
      const node = this.getDepartmentNode(parentName);
      await node.hover();
      await node.locator('button[title="添加子部门"]').click();
    } else {
      throw new Error('Adding root department not directly supported in this method yet');
    }

    await this.customModal.waitForOpen();
    // DepartmentModal input placeholder is "请输入部门名称"
    await this.customModal.fillByName('请输入部门名称', newName);
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  async editDepartment(oldName: string, newName: string): Promise<void> {
    const node = this.getDepartmentNode(oldName);
    await node.hover();
    await node.locator('button[title="编辑部门"]').click();

    await this.customModal.waitForOpen();
    await this.customModal.fillByName('请输入部门名称', newName);
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  async deleteDepartment(name: string): Promise<void> {
    const node = this.getDepartmentNode(name);
    await node.hover();
    await node.locator('button[title="删除部门"]').click();

    // The delete confirmation MIGHT be using StandardModal or another custom one.
    // EmployeeList.tsx uses `StandardModal` for delete confirmation?
    // Actually, EmployeeList.tsx has `<StandardModal ... title="删除确认">`
    // So for delete, we use standardModal.
    await this.standardModal.waitForOpen();
    await this.standardModal.confirm();
    await this.standardModal.waitForClose();
  }

  async expectDepartmentVisible(name: string): Promise<void> {
    await expect(this.getDepartmentNode(name)).toBeVisible();
  }

  async expectDepartmentNotVisible(name: string): Promise<void> {
    await expect(this.getDepartmentNode(name)).not.toBeVisible();
  }

  // --- Employee Modal Actions (for Verification) ---

  async openAddEmployeeModal(): Promise<void> {
    await this.page.getByRole('button', { name: /添加/ }).click();
    // EmployeeModal is Custom
    await this.customModal.waitForOpen();
  }

  async closeAddEmployeeModal(): Promise<void> {
      await this.customModal.close();
      await this.customModal.waitForClose();
  }

  /**
   * Check if a department exists in the department selector of the Employee Modal
   */
  async checkDepartmentInSelect(deptName: string): Promise<void> {
    // 1. Click "请选择部门" input in EmployeeModal (Custom)
    const customContent = this.customModal.root.locator('.bg-white.rounded-lg');
    await customContent.getByPlaceholder('请选择部门').click();
    
    // 2. This opens PersonnelSelectionModal (Standard, role="dialog")
    // Wait for the SECOND modal (Standard) to be on top
    await this.standardModal.waitForOpen();
    
    // 3. Check if department is visible in the tree inside StandardModal
    // The PersonnelSelectionModal has a left panel with DepartmentTree
    // We can look for the text of the department
    await expect(this.standardModal.root.getByText(deptName)).toBeVisible();
    
    // 4. Close the PersonnelSelectionModal
    await this.standardModal.close();
    await this.standardModal.waitForClose();
  }
}
