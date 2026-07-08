import { test, expect } from '@playwright/test';

test.describe('Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.click('text=Student');
    await page.fill('input[type="email"]', 'rahul@gmail.com');
    await page.fill('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should load dashboard and submit a new complaint', async ({ page }) => {
    // Ensure dashboard loaded
    await expect(page.locator('h1:has-text("Student Dashboard")')).toBeVisible();

    // Navigate to submit complaint
    await page.click('text=Submit Complaint');
    await expect(page.locator('h2:has-text("Submit Complaint")')).toBeVisible();

    // Fill form
    await page.fill('input[placeholder="304"]', 'A-304');
    await page.selectOption('select', 'Electrical');
    await page.fill('textarea[placeholder="Describe the issue in detail..."]', 'This is a test complaint from E2E suite');
    await page.click('button:has-text("Submit Complaint")');

    // Should show success toast
    await expect(page.locator('text=Complaint submitted successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('should load AI Chat and send a message', async ({ page }) => {
    await page.click('text=AI Chat');
    await expect(page).toHaveURL(/\/chat/);

    // Send a message
    await page.fill('textarea[placeholder*="Type your request here"]', 'Hello, this is an automated E2E test message.');
    await page.click('button[type="submit"]');

    // Verify AI responds (we'll just wait for the response bubble)
    await expect(page.locator('.chat-bubble')).not.toHaveCount(0);
  });

  test('should open SOS modal and submit emergency', async ({ page }) => {
    // Click SOS
    await page.click('text=SOS Emergency');
    
    // Check if modal opens
    await expect(page.locator('h2:has-text("Emergency Alert")')).toBeVisible();

    // Confirm SOS
    await page.click('button:has-text("TRIGGER EMERGENCY")');
    
    // Should show success
    await expect(page.locator('text=Emergency alert sent successfully').or(page.locator('text=Alert sent'))).toBeVisible({ timeout: 5000 });
  });
});
