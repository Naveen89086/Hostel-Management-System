# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: warden.spec.ts >> Warden Portal >> should load manage complaints and resolve one
- Location: tests\warden.spec.ts:23:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[title="View Details"]').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e6]:
        - img [ref=e7]
        - generic [ref=e11]: SmartHostel
      - navigation [ref=e12]:
        - link "Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /warden/dashboard
          - img [ref=e14]
          - generic [ref=e19]: Dashboard
        - link "Manage Complaints" [active] [ref=e20] [cursor=pointer]:
          - /url: /warden/complaints
          - img [ref=e21]
          - generic [ref=e24]: Manage Complaints
        - link "Approve Leaves" [ref=e25] [cursor=pointer]:
          - /url: /warden/leaves
          - img [ref=e26]
          - generic [ref=e29]: Approve Leaves
        - link "Emergency Alerts" [ref=e30] [cursor=pointer]:
          - /url: /warden/alerts
          - img [ref=e31]
          - generic [ref=e33]: Emergency Alerts
        - link "Hostel Reports" [ref=e34] [cursor=pointer]:
          - /url: /warden/reports
          - img [ref=e35]
          - generic [ref=e38]: Hostel Reports
        - button "Logout" [ref=e39] [cursor=pointer]:
          - img [ref=e40]
          - generic [ref=e43]: Logout
    - generic [ref=e44]:
      - banner [ref=e45]:
        - generic:
          - heading [level=1]
        - generic [ref=e46]:
          - button "Toggle theme" [ref=e47] [cursor=pointer]:
            - img [ref=e48]
          - button [ref=e50] [cursor=pointer]:
            - img [ref=e51]
          - button [ref=e56] [cursor=pointer]:
            - img [ref=e58]
      - main [ref=e61]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - heading "Warden Dashboard" [level=1] [ref=e66]
            - generic [ref=e67]:
              - generic [ref=e68]: WA
              - generic [ref=e69]: warden
          - generic [ref=e70]:
            - img [ref=e71]
            - generic [ref=e74]: "Select Block:"
            - button "Block A" [ref=e75] [cursor=pointer]
            - button "Block B" [ref=e76] [cursor=pointer]
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e79]:
                - img [ref=e80]
                - heading "Recent Complaints" [level=2] [ref=e83]
              - generic [ref=e84]:
                - textbox "Search rooms..." [ref=e85]
                - button "Filter" [ref=e86] [cursor=pointer]:
                  - img [ref=e87]
                  - text: Filter
            - generic [ref=e89]:
              - img [ref=e90]
              - paragraph [ref=e93]: No complaints found in Block A.
    - button [ref=e95] [cursor=pointer]:
      - img [ref=e98]
  - generic [ref=e100]: "0"
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
> 31 |         await page.click('button[title="View Details"] >> nth=0');
     |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
  32 |         await expect(page.locator('h2:has-text("Complaint Details")')).toBeVisible();
  33 |         
  34 |         // We can optionally close it
  35 |         await page.click('button:has(svg.lucide-x)');
  36 |       }
  37 |   });
  38 | 
  39 |   test('should load approve leaves', async ({ page }) => {
  40 |     await page.click('text=Approve Leaves');
  41 |     await expect(page).toHaveURL(/\/warden\/leaves/);
  42 |     await expect(page.locator('h2:has-text("Pending Leave Requests")')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should load hostel reports', async ({ page }) => {
  46 |     await page.click('text=Hostel Reports');
  47 |     await expect(page).toHaveURL(/\/warden\/reports/);
  48 |     await expect(page.locator('h1:has-text("Hostel Reports")')).toBeVisible();
  49 |   });
  50 | });
  51 | 
```