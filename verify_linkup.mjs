import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

await mkdir('/tmp/linkup-screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

// 1. Dashboard
await page.goto('http://localhost:5173');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/linkup-screenshots/01-dashboard.png' });
console.log('✅ Step 1: Dashboard loaded');
console.log('  Title visible:', await page.locator('text=Bonjour').isVisible());
console.log('  Contacts stat:', await page.locator('text=Contacts').first().isVisible());

// 2. Navigate to "Ajouter" via bottom nav (exact match)
await page.locator('nav button:has-text("Ajouter")').click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/linkup-screenshots/02-form-empty.png' });
console.log('✅ Step 2: Contact form opened');
console.log('  Form header visible:', await page.locator('text=Nouveau contact').isVisible());

// 3. Fill in the form
await page.fill('input[placeholder="Jean"]', 'Marie');
await page.fill('input[placeholder="Dupont"]', 'Laurent');

// Select birthday
const selects = page.locator('select');
await selects.nth(0).selectOption('04'); // April
await selects.nth(1).selectOption('15');

// Select relationship
await page.locator('button:has-text("Collègue actuel")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/linkup-screenshots/03-form-filled.png' });
console.log('✅ Step 3: Form filled');

// 4. Submit
await page.locator('button:has-text("Ajouter le contact")').click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/linkup-screenshots/04-contact-detail.png' });
console.log('✅ Step 4: Contact saved');
console.log('  Name visible:', await page.locator('text=Marie Laurent').isVisible());
const bdText = await page.locator('text=15 avril').isVisible();
console.log('  Birthday visible:', bdText);
console.log('  Relation badge:', await page.locator('text=Collègue actuel').isVisible());

// 5. Contacts list via bottom nav
await page.locator('nav button:has-text("Contacts")').click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/linkup-screenshots/05-contacts-list.png' });
console.log('✅ Step 5: Contacts list');
console.log('  Contact in list:', await page.locator('text=Marie Laurent').isVisible());

// 6. Dashboard
await page.locator('nav button:has-text("Accueil")').click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/linkup-screenshots/06-dashboard-with-birthday.png' });
console.log('✅ Step 6: Dashboard with birthday');
const bdEntries = await page.locator('text=Dans').count();
console.log('  Birthday entries:', bdEntries);

// 7. PROBE: empty form validation
await page.locator('nav button:has-text("Ajouter")').click();
await page.waitForTimeout(300);
await page.locator('button:has-text("Ajouter le contact")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/linkup-screenshots/07-validation.png' });
console.log('🔍 Probe: Empty form validation');
console.log('  Validation error shown:', await page.locator('text=Prénom requis').isVisible());

await browser.close();
console.log('\nAll screenshots saved to /tmp/linkup-screenshots/');
