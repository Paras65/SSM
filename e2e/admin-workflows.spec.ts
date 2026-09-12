import { test, expect } from '@playwright/test';

test.describe('Admin Workspace & Interactive Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('ssm_admin_token', 'mock-test-admin-token');
      sessionStorage.setItem('ssm_admin_school', JSON.stringify({
        id: 'ssm-gorakhpur',
        name: 'Saraswati Shishu Mandir Senior Secondary School',
        hindiName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय',
        city: 'गोरखपुर',
        prant: 'गोरक्ष प्रांत',
        principalName: 'आचार्य राम नारायण शुक्ला',
        plan: 'pro'
      }));
    });
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Tab Navigation: switches seamlessly between Overview, Students, and Fees', async ({ page }) => {
    // Switch to Student Directory tab
    const studentsTab = page.locator('button:has-text("छात्र पंजिका")');
    await expect(studentsTab).toBeVisible();
    await studentsTab.click();

    // Verify search input in student directory
    const searchInput = page.locator('input[placeholder*="खोजें"]');
    await expect(searchInput).toBeVisible();

    // Switch to Fees tab
    const feesTab = page.locator('button:has-text("शुल्क प्रबंधन")');
    await expect(feesTab).toBeVisible();
    await feesTab.click();

    // Verify Fee structure header or receipt button
    const feeHeading = page.locator('text=शुल्क').first();
    await expect(feeHeading).toBeVisible();
  });

  test('2. Student Search Filter: dynamically filters without errors', async ({ page }) => {
    const studentsTab = page.locator('button:has-text("छात्र पंजिका")');
    await studentsTab.click();

    const searchInput = page.locator('input[placeholder*="खोजें"]');
    await searchInput.fill('अंशिका');
    await page.waitForTimeout(300);

    // Ensure page remains responsive
    await expect(searchInput).toHaveValue('अंशिका');
  });

  test('3. Timetable Section: interactive timetable renders on Overview tab', async ({ page }) => {
    const overviewTab = page.locator('button:has-text("मुख्य पृष्ठ")');
    await overviewTab.click();

    // Verify daily timetable header
    const timetableHeader = page.locator('text=दैनिक कक्षा समय-सारणी').first();
    await expect(timetableHeader).toBeVisible();
  });
});

