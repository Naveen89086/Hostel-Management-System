import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization', () => {
  test('should display validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Select Student role first
    await page.click('text=Student');
    
    // Attempt to submit empty form
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Student');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('should login as admin and route to admin dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Administrator');
    await page.fill('input[type="email"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', 'admin123'); 
    await page.click('button[type="submit"]');
    
    // Wait a little bit for API response
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login_error.png' });
    
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Administrator Dashboard')).toBeVisible();
    
    // Test logout
    await page.click('text=Logout');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should login as warden and route to warden dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Warden');
    await page.fill('input[type="email"]', 'warden@gmail.com');
    await page.fill('input[type="password"]', 'warden123'); 
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/warden\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Warden Dashboard')).toBeVisible();
  });

  test('should login as student and route to student dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Student');
    await page.fill('input[type="email"]', 'rahul@gmail.com');
    await page.fill('input[type="password"]', 'student123'); 
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("Student Dashboard")')).toBeVisible();
  });
});
