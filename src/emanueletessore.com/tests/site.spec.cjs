const { test, expect } = require('@playwright/test');

// These smoke tests exercise local assets and behavior, not third-party services.
// Fonts, analytics, Pexels, GSAP and embedded players must not make CI flaky.
test.beforeEach(async ({ page, baseURL }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    // Preserve icon-only button geometry without fetching Font Awesome from a CDN.
    // The fixture must not require unrelated sizing changes in upstream templates.
    if (url.hostname === 'cdnjs.cloudflare.com' && url.pathname.includes('/font-awesome/')) {
      return route.fulfill({ contentType: 'text/css', body: '.fas::before,.fab::before{content:"\\\\25cf"}' });
    }
    return url.origin === new URL(baseURL).origin ? route.continue() : route.abort();
  });
});

for (const mode of ['dark', 'light']) {
  test(`home layout and theme toggle (${mode})`, async ({ page }, testInfo) => {
    await page.addInitScript(value => localStorage.setItem('darkMode', value), String(mode === 'dark'));
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveCSS('visibility', 'visible');
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-profile-ring img')).toBeVisible();
    const dark = page.locator('html');
    if (mode === 'dark') await expect(dark).toHaveClass(/dark/);
    else await expect(dark).not.toHaveClass(/dark/);

    const mobile = testInfo.project.name === 'mobile';
    await expect(page.locator(mobile ? '#darkModeToggle' : '#darkModeToggleMobile')).toBeHidden();
    const toggle = page.locator(mobile ? '#darkModeToggleMobile' : '#darkModeToggle');
    await expect(toggle).toBeVisible();
    const initialBackground = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    await toggle.click();
    await expect.poll(() => page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor))
      .not.toBe(initialBackground);
    if (mode === 'dark') await expect(dark).not.toHaveClass(/dark/);
    else await expect(dark).toHaveClass(/dark/);
    const portrait = await page.locator('.hero-profile-ring').boundingBox();
    expect(portrait.width / portrait.height).toBeCloseTo(1, 1);

    // Confirms the native Tailwind pipeline emitted responsive utilities and
    // preserves the v3 typography despite v4's leading/size precedence changes.
    await expect(page.locator('.hero-inner-row')).toHaveCSS('flex-direction', mobile ? 'column' : 'row');
    await expect(page.locator('.hero-section h1')).toHaveCSS('line-height', mobile ? '60px' : '72px');
    await expect(page.locator('.hero-section p')).toHaveCSS('line-height', mobile ? '29.25px' : '28px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (mobile) {
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await page.locator('#menu-btn').click();
      await expect(page.locator('#mobile-menu')).toBeVisible();
      await page.locator('#menu-btn').click();
      await expect(page.locator('#mobile-menu')).toBeHidden();
    }

    await page.screenshot({ path: testInfo.outputPath(`home-${mode}.png`), fullPage: true });
  });
}

test('about modal opacity, open and Escape close', async ({ page }) => {
  await page.goto('/');
  const modal = page.locator('#aboutModal');
  await expect(modal).toBeHidden();
  await page.locator('#aboutModalBtn').click();
  await expect(modal).toBeVisible();
  await expect(modal).toHaveCSS('display', 'flex');
  // Removed v3 bg-opacity-* utilities must not turn the overlay opaque.
  const alpha = await modal.evaluate(el => {
    const color = getComputedStyle(el).backgroundColor;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[3] / 255;
  });
  expect(alpha).toBeCloseTo(0.5, 1);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

for (const path of ['/docs/', '/docs/troubleshoot/kubernetes/cilium-network-timeout/', '/404.html']) {
  test(`renders ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveCSS('visibility', 'visible');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
    const brokenImages = await page.locator('main img').evaluateAll(images =>
      images.filter(img => new URL(img.src).origin === location.origin && img.complete && img.naturalWidth === 0)
        .map(img => img.src));
    expect(brokenImages).toEqual([]);
  });
}
