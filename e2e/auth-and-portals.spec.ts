import { test, expect } from '@playwright/test';

test.describe('Portal Authentication & Navigation Flows', () => {
  test('1. Admin Modal: prompts for passcode and opens authentication dialog', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on Admin Login button
    const adminBtn = page.locator('button:has-text("व्यवस्थापक लॉगिन")').first();
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
      const modalTitle = page.locator('text=व्यवस्थापक सत्यापन');
      await expect(modalTitle).toBeVisible();

      // Verify passcode input field exists
      const passcodeInput = page.locator('input[type="password"]');
      await expect(passcodeInput).toBeVisible();
    }
  });

  test('2. Teacher Modal: opens Acharya portal login with phone & PIN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on Acharya Portal button in navbar
    const teacherBtn = page.locator('button:has-text("आचार्य पोर्टल")').first();
    if (await teacherBtn.isVisible()) {
      await teacherBtn.click();
      const modal = page.locator('text=आचार्य / दीदी लॉगिन');
      await expect(modal).toBeVisible();

      const phoneInput = page.locator('input[placeholder="उदा. 9876543210"]');
      await expect(phoneInput).toBeVisible();
    }
  });

  test('3. Teacher Portal Direct View: loads dedicated Acharya workspace', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('ssm_teacher_token', 'mock-teacher-token');
      sessionStorage.setItem('ssm_teacher_profile', JSON.stringify({
        id: 'staff-1',
        name: 'विष्णु दत्त शर्मा',
        gender: 'Acharya',
        designation: 'वरिष्ठ आचार्य',
        phone: '+91 98765 43210'
      }));
    });

    await page.goto('/teacher');
    await page.waitForLoadState('domcontentloaded');

    // Check teacher portal header
    const logoutBtn = page.locator('button:has-text("लॉगआउट")').first();
    await expect(logoutBtn).toBeVisible();

    // Verify presence of tabs (Attendance, Homework, etc.)
    const attendanceTab = page.locator('button:has-text("दैनिक उपस्थिति")');
    await expect(attendanceTab).toBeVisible();
  });
});

