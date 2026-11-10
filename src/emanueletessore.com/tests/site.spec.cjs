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

test('article uses the available page width on desktop and stays within mobile viewport', async ({ page }) => {
  await page.goto('/docs/troubleshoot/kubernetes/cilium-network-timeout/');
  const container = page.locator('main section > div').first();
  const bounds = await container.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds.width).toBeCloseTo(Math.min(viewport.width, 1280), 0);
  const content = container.locator('.prose');
  const contentBounds = await content.boundingBox();
  const horizontalPadding = await container.evaluate(el => {
    const style = getComputedStyle(el);
    return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  });
  expect(contentBounds.width).toBeCloseTo(bounds.width - horizontalPadding, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('list featured image fills its card header without internal padding', async ({ page }) => {
  // A deterministic local response exercises the actual image element, not a failed CDN load.
  await page.route('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/**', route => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="#287b9c"/></svg>',
  }));
  await page.goto('/docs/');
  const image = page.locator('.project-card img').first();
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('padding', '0px');
  await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  const imageBounds = await image.boundingBox();
  const headerBounds = await image.locator('..').boundingBox();
  expect(imageBounds.width).toBeCloseTo(headerBounds.width, 0);
  expect(imageBounds.height).toBeCloseTo(256, 0);
  expect(imageBounds.height).toBeCloseTo(headerBounds.height, 0);
});

for (const path of ['/docs/', '/docs/troubleshoot/kubernetes/cilium-network-timeout/', '/404.html']) {
  test(`renders ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveCSS('visibility', 'visible');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main h1').first()).toBeVisible();
    if (path === '/docs/') {
      const intro = page.locator('main .markdown-content').first();
      await expect(intro).toHaveCSS('max-width', 'none');
      const introBounds = await intro.boundingBox();
      const gridBounds = await page.locator('main .grid').first().boundingBox();
      expect(introBounds.width).toBeCloseTo(gridBounds.width, 0);
    }
    const brokenImages = await page.locator('main img').evaluateAll(images =>
      images.filter(img => new URL(img.src).origin === location.origin && img.complete && img.naturalWidth === 0)
        .map(img => img.src));
    expect(brokenImages).toEqual([]);
  });
}
