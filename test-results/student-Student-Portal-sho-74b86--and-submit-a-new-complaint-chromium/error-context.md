# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student.spec.ts >> Student Portal >> should load dashboard and submit a new complaint
- Location: tests\student.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Submit Complaint")')
    - locator resolved to 2 elements. Proceeding with the first one: <button class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    48 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

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
          - /url: /dashboard
          - img [ref=e14]
          - generic [ref=e19]: Dashboard
        - link "AI Chat" [ref=e20] [cursor=pointer]:
          - /url: /chat
          - img [ref=e21]
          - generic [ref=e23]: AI Chat
        - link "My Activity" [ref=e27] [cursor=pointer]:
          - /url: /activity
          - img [ref=e28]
          - generic [ref=e31]: My Activity
        - button "Submit Complaint" [ref=e32] [cursor=pointer]:
          - img [ref=e33]
          - generic [ref=e36]: Submit Complaint
        - button "Apply Leave" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: Apply Leave
        - button "SOS Emergency" [ref=e42] [cursor=pointer]:
          - img [ref=e43]
          - generic [ref=e45]: SOS Emergency
        - link "Profile" [ref=e46] [cursor=pointer]:
          - /url: /profile
          - img [ref=e47]
          - generic [ref=e51]: Profile
        - button "Logout" [ref=e52] [cursor=pointer]:
          - img [ref=e53]
          - generic [ref=e56]: Logout
    - generic [ref=e57]:
      - banner [ref=e58]:
        - heading "Dashboard" [level=1] [ref=e60]
        - generic [ref=e61]:
          - button "Toggle theme" [ref=e62] [cursor=pointer]:
            - img [ref=e63]
          - button [ref=e65] [cursor=pointer]:
            - img [ref=e66]
          - button [ref=e71] [cursor=pointer]:
            - img [ref=e73]
      - main [ref=e76]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - heading "Student Dashboard" [level=1] [ref=e81]
            - generic [ref=e82]:
              - generic [ref=e83]: ST
              - generic [ref=e84]: student
          - generic [ref=e85]:
            - generic [ref=e86]:
              - img [ref=e88]
              - generic [ref=e90]:
                - paragraph [ref=e91]: Total Complaints
                - heading "1" [level=3] [ref=e92]
            - generic [ref=e93]:
              - img [ref=e95]
              - generic [ref=e98]:
                - paragraph [ref=e99]: Pending
                - heading "1" [level=3] [ref=e100]
            - generic [ref=e101]:
              - img [ref=e103]
              - generic [ref=e106]:
                - paragraph [ref=e107]: Resolved
                - heading "0" [level=3] [ref=e108]
            - generic [ref=e109]:
              - img [ref=e111]
              - generic [ref=e113]:
                - paragraph [ref=e114]: Emergency Alerts
                - heading "1" [level=3] [ref=e115]
          - generic [ref=e116]:
            - heading "My Complaint Analytics (Last 6 Months)" [level=2] [ref=e117]
            - generic [ref=e120]:
              - list [ref=e122]:
                - listitem [ref=e123]:
                  - img "In Progress legend icon" [ref=e124]
                  - text: In Progress
                - listitem [ref=e126]:
                  - img "Pending legend icon" [ref=e127]
                  - text: Pending
                - listitem [ref=e129]:
                  - img "Rejected legend icon" [ref=e130]
                  - text: Rejected
                - listitem [ref=e132]:
                  - img "Resolved legend icon" [ref=e133]
                  - text: Resolved
                - listitem [ref=e135]:
                  - img "Total legend icon" [ref=e136]
                  - text: Total
              - application [ref=e138]:
                - generic [ref=e185]:
                  - generic [ref=e186]:
                    - generic [ref=e188]: Feb
                    - generic [ref=e190]: Mar
                    - generic [ref=e192]: Apr
                    - generic [ref=e194]: May
                    - generic [ref=e196]: Jun
                    - generic [ref=e198]: Jul
                  - generic [ref=e199]:
                    - generic [ref=e201]: "0"
                    - generic [ref=e203]: "1"
                    - generic [ref=e205]: "2"
                    - generic [ref=e207]: "3"
                    - generic [ref=e209]: "4"
    - button [ref=e211] [cursor=pointer]:
      - img [ref=e214]
    - generic [ref=e217]:
      - generic [ref=e218]:
        - heading "Submit Complaint" [level=2] [ref=e219]
        - button [ref=e220] [cursor=pointer]:
          - img [ref=e221]
      - generic [ref=e225]:
        - generic [ref=e226]:
          - text: Room Number
          - textbox "304" [ref=e227]: A-304
        - generic [ref=e228]:
          - text: Category
          - combobox [ref=e229]:
            - option "Select Category" [disabled]
            - option "Electrical" [selected]
            - option "Plumbing"
            - option "Cleaning"
            - option "Internet/Wi-Fi"
            - option "Other"
        - generic [ref=e230]:
          - text: Description
          - textbox "Describe the issue in detail..." [active] [ref=e231]: This is a test complaint from E2E suite
        - button "Submit Complaint" [ref=e233] [cursor=pointer]:
          - img [ref=e234]
          - text: Submit Complaint
  - generic [ref=e237]: "0"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Student Portal', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login before each test
  6  |     await page.goto('/login');
  7  |     await page.click('text=Student');
  8  |     await page.fill('input[type="email"]', 'rahul@gmail.com');
  9  |     await page.fill('input[type="password"]', 'student123');
  10 |     await page.click('button[type="submit"]');
  11 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  12 |   });
  13 | 
  14 |   test('should load dashboard and submit a new complaint', async ({ page }) => {
  15 |     // Ensure dashboard loaded
  16 |     await expect(page.locator('h1:has-text("Student Dashboard")')).toBeVisible();
  17 | 
  18 |     // Navigate to submit complaint
  19 |     await page.click('text=Submit Complaint');
  20 |     await expect(page.locator('h2:has-text("Submit Complaint")')).toBeVisible();
  21 | 
  22 |     // Fill form
  23 |     await page.fill('input[placeholder="304"]', 'A-304');
  24 |     await page.selectOption('select', 'Electrical');
  25 |     await page.fill('textarea[placeholder="Describe the issue in detail..."]', 'This is a test complaint from E2E suite');
> 26 |     await page.click('button:has-text("Submit Complaint")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  27 | 
  28 |     // Should show success toast
  29 |     await expect(page.locator('text=Complaint submitted successfully!')).toBeVisible({ timeout: 5000 });
  30 |   });
  31 | 
  32 |   test('should load AI Chat and send a message', async ({ page }) => {
  33 |     await page.click('text=AI Chat');
  34 |     await expect(page).toHaveURL(/\/chat/);
  35 | 
  36 |     // Send a message
  37 |     await page.fill('textarea[placeholder*="Type your request here"]', 'Hello, this is an automated E2E test message.');
  38 |     await page.click('button[type="submit"]');
  39 | 
  40 |     // Verify AI responds (we'll just wait for the response bubble)
  41 |     await expect(page.locator('.chat-bubble')).not.toHaveCount(0);
  42 |   });
  43 | 
  44 |   test('should open SOS modal and submit emergency', async ({ page }) => {
  45 |     // Click SOS
  46 |     await page.click('text=SOS Emergency');
  47 |     
  48 |     // Check if modal opens
  49 |     await expect(page.locator('h2:has-text("Emergency Alert")')).toBeVisible();
  50 | 
  51 |     // Confirm SOS
  52 |     await page.click('button:has-text("TRIGGER EMERGENCY")');
  53 |     
  54 |     // Should show success
  55 |     await expect(page.locator('text=Emergency alert sent successfully').or(page.locator('text=Alert sent'))).toBeVisible({ timeout: 5000 });
  56 |   });
  57 | });
  58 | 
```