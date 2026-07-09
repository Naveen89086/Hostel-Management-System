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

    // Fill form (Room Number is read-only and auto-filled, so we only select category and fill description)
    await page.selectOption('select', 'Electrical');
    await page.fill('textarea[placeholder="Describe the issue in detail..."]', 'This is a test complaint from E2E suite');
    await page.click('button[type="submit"]:has-text("Submit Complaint")');

    // Should show success toast
    await expect(page.locator('text=Complaint submitted successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('should open SOS modal and submit emergency', async ({ page }) => {
    // Mock geolocation to return dummy coordinates
    await page.evaluate(() => {
      const mockGeolocation = {
        getCurrentPosition: (success: Function, error: Function) => {
          success({
            coords: {
              latitude: 12.9716,
              longitude: 77.5946,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        }
      };
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true
      });
    });

    // Click SOS
    await page.click('text=SOS Emergency');
    
    // Check if modal opens
    await expect(page.locator('h2:has-text("Emergency Alert")')).toBeVisible();

    // Confirm SOS
    await page.click('button:has-text("TRIGGER EMERGENCY")');
    
    // Should show success (case-insensitive checks)
    await expect(page.locator('text=Emergency Alert sent successfully').or(page.locator('text=Alert sent'))).toBeVisible({ timeout: 10000 });
  });
});
