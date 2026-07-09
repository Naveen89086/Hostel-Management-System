# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: warden.spec.ts >> Warden Portal >> should load approve leaves
- Location: tests\warden.spec.ts:40:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2:has-text("Pending Leave Requests")')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('h2:has-text("Pending Leave Requests")')

```

```yaml
- complementary:
  - img
  - text: SmartHostel
  - navigation:
    - link "Dashboard":
      - /url: /warden/dashboard
      - img
      - text: Dashboard
    - link "Manage Complaints":
      - /url: /warden/complaints
      - img
      - text: Manage Complaints
    - link "Approve Leaves":
      - /url: /warden/leaves
      - img
      - text: Approve Leaves
    - link "Emergency Alerts":
      - /url: /warden/alerts
      - img
      - text: Emergency Alerts
    - link "Hostel Reports":
      - /url: /warden/reports
      - img
      - text: Hostel Reports
    - button "Logout":
      - img
      - text: Logout
- banner:
  - heading [level=1]
  - button "Toggle theme":
    - img
  - button:
    - img
  - button:
    - img
- main:
  - heading "Warden Dashboard" [level=1]
  - text: WA warden
  - img
  - paragraph: Total Complaints
  - heading "10" [level=3]
  - img
  - paragraph: Pending
  - heading "8" [level=3]
  - img
  - paragraph: Resolved
  - heading "2" [level=3]
  - heading "Dynamic Analytics" [level=2]
  - button "daily"
  - button "weekly"
  - button "monthly"
  - list:
    - listitem:
      - img "In Progress legend icon"
      - text: In Progress
    - listitem:
      - img "Pending legend icon"
      - text: Pending
    - listitem:
      - img "Rejected legend icon"
      - text: Rejected
    - listitem:
      - img "Resolved legend icon"
      - text: Resolved
    - listitem:
      - img "Total legend icon"
      - text: Total
  - application:
    - 'slider "Min value: Aug 2025, Max value: Jul 2026"'
    - 'slider "Min value: Aug 2025, Max value: Jul 2026"'
    - text: Aug 2025 Sep 2025 Oct 2025 Nov 2025 Dec 2025 Jan 2026 Feb 2026 Mar 2026 Apr 2026 May 2026 Jun 2026 Jul 2026 0 3 6 9 12
- button "Chat":
  - img "Chat"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Warden Portal', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login before each test
  6  |     await page.goto('/login');
  7  |     await page.click('text=Warden');
  8  |     await page.fill('input[type="email"]', 'warden@gmail.com');
  9  |     await page.fill('input[type="password"]', 'warden123');
  10 |     await page.click('button[type="submit"]');
  11 |     await expect(page).toHaveURL(/\/warden\/dashboard/, { timeout: 10000 });
  12 |   });
  13 | 
  14 |   test('should load dashboard and show stats', async ({ page }) => {
  15 |     // Check if dashboard renders correctly
  16 |     await expect(page.locator('h1:has-text("Warden Dashboard")')).toBeVisible();
  17 |     
  18 |     // Check if summary cards exist (Total Complaints, Emergency Alerts etc.)
  19 |     await expect(page.locator('text=Total Complaints')).toBeVisible();
  20 |     await expect(page.locator('text=Emergency Alerts')).toBeVisible();
  21 |   });
  22 | 
  23 |   test('should load manage complaints and resolve one', async ({ page }) => {
  24 |     await page.click('text=Manage Complaints');
  25 |     await expect(page).toHaveURL(/\/warden\/complaints/);
  26 | 
  27 |     // Depending on state, either we see "No complaints" or a list
  28 |     const noComplaints = await page.locator('text=No complaints found').isVisible();
  29 |     if (!noComplaints) {
  30 |         // If there are complaints, verify we can click one and open the modal
  31 |         await page.waitForSelector('button[title="View Details"]', { state: 'visible' });
  32 |         await page.locator('button[title="View Details"]').first().click({ force: true });
  33 |         await expect(page.locator('h2:has-text("Complaint Details")')).toBeVisible();
  34 |         
  35 |         // We can optionally close it
  36 |         await page.click('button:has(svg.lucide-x)');
  37 |       }
  38 |   });
  39 | 
  40 |   test('should load approve leaves', async ({ page }) => {
  41 |     await page.click('text=Approve Leaves');
  42 |     await expect(page).toHaveURL(/\/warden\/leaves/);
> 43 |     await expect(page.locator('h2:has-text("Pending Leave Requests")')).toBeVisible({ timeout: 15000 });
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
  44 |   });
  45 | 
  46 |   test('should load hostel reports', async ({ page }) => {
  47 |     await page.click('text=Hostel Reports');
  48 |     await expect(page).toHaveURL(/\/warden\/reports/);
  49 |     await expect(page.locator('h1:has-text("Hostel Reports")')).toBeVisible({ timeout: 15000 });
  50 |   });
  51 | });
  52 | 
```