import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Zero Horizontal Overflow Suite', () => {
  test('1. Public Homepage: strictly fits within 100vw without horizontal scrollbar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Evaluate scroll width vs viewport width
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth
      };
    });

    // Horizontal overflow must be zero (scrollWidth must not exceed innerWidth)
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
    expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
  });

  test('2. Admin Dashboard: retains 2-tier mobile header without horizontal overflow', async ({ page }) => {
    // Navigate directly to admin with mock token
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

    // Verify Admin Dashboard renders
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify overflow on Admin Dashboard
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth
      };
    });

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
    expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);
  });
});

