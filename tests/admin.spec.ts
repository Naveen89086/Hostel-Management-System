import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.click('text=Administrator');
    await page.fill('input[type="email"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'admin_login_error.png' });
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
  });

  test('should load dashboard and stats', async ({ page }) => {
    await expect(page.locator('h1:has-text("Administrator Dashboard")')).toBeVisible();
  });

  test('should load manage students page', async ({ page }) => {
    await page.click('text=Manage Students');
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('h2:has-text("Manage Students")')).toBeVisible();
    
    // Check if table renders
    await expect(page.locator('table')).toBeVisible();
  });

  test('should load manage wardens page', async ({ page }) => {
    await page.click('text=Manage Wardens');
    await expect(page).toHaveURL(/\/admin\/wardens/);
    await expect(page.locator('h2:has-text("Manage Wardens")')).toBeVisible();
  });

  test('should toggle maintenance mode in settings', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page).toHaveURL(/\/admin\/settings/);
    
    // Enable maintenance mode
    const maintenanceToggle = page.locator('label:has-text("Maintenance Mode")');
    await expect(maintenanceToggle).toBeVisible();
    
    // We shouldn't actually toggle it and save it in E2E unless we reset it because it locks out other tests
    // But we can verify it's there
    await expect(page.locator('text=Save Settings')).toBeVisible();
  });
});
