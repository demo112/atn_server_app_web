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

  async fillByPlaceholder(placeholder: string, value: string): Promise<void> {
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.getByPlaceholder(placeholder).fill(value);
  }

  async fillByName(name: string, value: string): Promise<void> {
    const content = this.root.locator('.bg-white.rounded-lg');
    await content.locator(`input[name="${name}"]`).fill(value);
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
    return this.page.locator('.group').filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async selectDepartment(name: string): Promise<void> {
    const node = this.getDepartmentNode(name);
    await node.click();
  }

  async addDepartment(parentName: string | null, newName: string): Promise<void> {
    if (parentName) {
      const node = this.getDepartmentNode(parentName);
      await node.hover();
      await node.locator('button[title="添加子部门"]').click();
    } else {
      throw new Error('Adding root department not directly supported in this method yet');
    }

    await this.customModal.waitForOpen();
    await this.customModal.fillByPlaceholder('请输入部门名称', newName);
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  async editDepartment(oldName: string, newName: string): Promise<void> {
    const node = this.getDepartmentNode(oldName);
    await node.hover();
    await node.locator('button[title="编辑部门"]').click();

    await this.customModal.waitForOpen();
    await this.customModal.fillByPlaceholder('请输入部门名称', newName);
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  async deleteDepartment(name: string): Promise<void> {
    const node = this.getDepartmentNode(name);
    await node.hover();
    await node.locator('button[title="删除部门"]').click();

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

  // --- Employee Actions ---

  async openAddEmployeeModal(): Promise<void> {
    await this.page.getByRole('button', { name: /添加/ }).click();
    await this.customModal.waitForOpen();
  }

  async closeAddEmployeeModal(): Promise<void> {
    await this.customModal.close();
    await this.customModal.waitForClose();
  }

  async fillEmployeeForm(data: {
    name: string;
    employeeNo: string;
    department?: string;
    phone?: string;
    hireDate?: string;
  }): Promise<void> {
    await this.customModal.fillByName('name', data.name);
    
    if (data.employeeNo) {
        await this.customModal.fillByName('employeeNo', data.employeeNo);
    }

    if (data.phone) {
      await this.customModal.fillByName('phone', data.phone);
    }

    if (data.hireDate) {
      await this.customModal.fillByName('hireDate', data.hireDate);
    }

    if (data.department) {
      // Click department input to open selection modal
      const content = this.customModal.root.locator('.bg-white.rounded-lg');
      await content.getByPlaceholder('请选择部门').click();
      
      // Wait for selection modal (StandardModal structure, role="dialog")
      // Note: PersonnelSelectionModal uses StandardModal which has role="dialog"
      // We need to target the one that says "选择部门"
      const selectionModal = this.page.locator('[role="dialog"]').filter({ hasText: '选择部门' });
      await selectionModal.waitFor();
      
      // Select department in the tree inside the modal
      // Assuming DepartmentTree component is reused and has same locators
      // We can use getByText for the department name inside the modal
      await selectionModal.getByText(data.department, { exact: true }).click();
      
      // Confirm selection
      await selectionModal.getByRole('button', { name: '确定' }).click();
      await selectionModal.waitFor({ state: 'hidden' });
    }
  }

  async saveEmployee(): Promise<void> {
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  async expectEmployeeVisible(name: string): Promise<void> {
    await expect(this.page.locator('tbody tr').filter({ hasText: name })).toBeVisible();
  }

  async expectEmployeeNotVisible(name: string): Promise<void> {
    await expect(this.page.locator('tbody tr').filter({ hasText: name })).not.toBeVisible();
  }

  async deleteEmployee(name: string): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: name });
    // Click delete icon
    await row.locator('.material-icons').filter({ hasText: 'delete_outline' }).click();
    
    // Confirm delete (Custom Modal)
    // The confirm modal in EmployeeList.tsx has similar structure to CustomModal
    // We can reuse the customModal instance or create a temporary one if needed
    // But since it's the same structure, `this.customModal` should work
    await this.customModal.waitForOpen();
    await this.customModal.confirm(); // "确定"
    await this.customModal.waitForClose();
  }

  async editEmployee(oldName: string, data: { name?: string, phone?: string }): Promise<void> {
    const row = this.page.locator('tbody tr').filter({ hasText: oldName });
    // Click edit icon
    await row.locator('.material-icons').filter({ hasText: 'edit' }).click();
    
    await this.customModal.waitForOpen();
    
    if (data.name) {
      await this.customModal.fillByName('name', data.name);
    }
    if (data.phone) {
      await this.customModal.fillByName('phone', data.phone);
    }
    
    await this.customModal.confirm();
    await this.customModal.waitForClose();
  }

  /**
   * Check if a department exists in the department selector of the Employee Modal
   */
  async checkDepartmentInSelect(deptName: string): Promise<void> {
    const content = this.customModal.root.locator('.bg-white.rounded-lg');
    await content.getByPlaceholder('请选择部门').click();
    
    const selectionModal = this.page.locator('[role="dialog"]').filter({ hasText: '选择部门' });
    await selectionModal.waitFor();
    await expect(selectionModal.getByText(deptName)).toBeVisible();
    
    await selectionModal.getByRole('button', { name: '取消' }).click();
    await selectionModal.waitFor({ state: 'hidden' });
  }
}
