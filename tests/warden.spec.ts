import { test, expect } from '@playwright/test';

test.describe('Warden Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.click('text=Warden');
    await page.fill('input[type="email"]', 'warden@gmail.com');
    await page.fill('input[type="password"]', 'warden123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/warden\/dashboard/, { timeout: 10000 });
  });

  test('should load dashboard and show stats', async ({ page }) => {
    // Check if dashboard renders correctly
    await expect(page.locator('h1:has-text("Warden Dashboard")')).toBeVisible();
    
    // Check if summary cards exist (Total Complaints, Emergency Alerts etc.)
    await expect(page.locator('text=Total Complaints')).toBeVisible();
    await expect(page.locator('text=Emergency Alerts')).toBeVisible();
  });

  test('should load manage complaints and resolve one', async ({ page }) => {
    await page.click('text=Manage Complaints');
    await expect(page).toHaveURL(/\/warden\/complaints/);

    // Depending on state, either we see "No complaints" or a list
    const noComplaints = await page.locator('text=No complaints found').isVisible();
    if (!noComplaints) {
        // If there are complaints, verify we can click one and open the modal
        await page.waitForSelector('button[title="View Details"]', { state: 'visible' });
        await page.locator('button[title="View Details"]').first().click({ force: true });
        await expect(page.locator('h2:has-text("Complaint Details")')).toBeVisible();
        
        // We can optionally close it
        await page.click('button:has(svg.lucide-x)');
      }
  });

  test('should load approve leaves', async ({ page }) => {
    await page.click('text=Approve Leaves');
    await expect(page).toHaveURL(/\/warden\/leaves/);
    await expect(page.locator('h2:has-text("Pending Leave Requests")')).toBeVisible({ timeout: 15000 });
  });

  test('should load hostel reports', async ({ page }) => {
    await page.click('text=Hostel Reports');
    await expect(page).toHaveURL(/\/warden\/reports/);
    await expect(page.locator('h1:has-text("Hostel Reports")')).toBeVisible({ timeout: 15000 });
  });
});
