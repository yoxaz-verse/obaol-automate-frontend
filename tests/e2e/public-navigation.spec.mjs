import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.use({ browserName: 'webkit', isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

for (const width of [375, 390, 1024, 1280, 1440]) {
  for (const signedIn of [false, true]) {
    test(`public navigation at ${width}px, ${signedIn ? 'signed in' : 'signed out'}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.route('**/verify-token*', route => route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: signedIn, user: signedIn ? { id: 'nav-test', name: 'Navigation test', role: 'Associate' } : null }),
      }));
      await page.goto('/about');
      const header = page.locator('header').filter({ has: page.getByRole('navigation', { name: 'Primary navigation', includeHidden: true }) });
      const mobile = width < 1024;
      const trigger = () => header.getByRole('button', { name: mobile ? /^(Open|Close) menu$/ : 'More', exact: !mobile });
      await expect(header.getByRole('link', { name: signedIn ? 'Open workspace' : 'Get Started', exact: true })).toBeVisible();
      await expect(page.locator('#public-page-directory')).toHaveCount(0);
      await trigger().focus();
      await page.keyboard.press('Enter');
      const directory = page.getByRole('navigation', { name: 'All public pages' });
      await expect(directory).toBeVisible();
      await expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      await expect(directory.getByRole('link', { name: 'About OBAOL', exact: true })).toHaveAttribute('aria-current', 'page');
      const hrefs = await directory.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')));
      expect(new Set(hrefs).size).toBe(hrefs.length);
      expect(hrefs).toEqual(expect.arrayContaining(['/', '/about', '/roles', '/roles/associate', '/roles/operator', '/trade-directory', '/product', '/companies', '/obaol', '/quick-commerce-procurement', '/procurement', '/verification', '/trade-finance', '/faq', '/export-resources', '/commission-structure', '/methods', '/developer', '/trust', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/why-obaol', '/how-it-works']));
      const roleSource = fs.readFileSync('src/data/associateRoles.ts', 'utf8');
      for (const [, slug] of roleSource.matchAll(/slug: "([^"]+)"/g)) expect(hrefs).toContain(`/roles/associate/${slug}`);
      for (const href of hrefs) {
        const file = href.startsWith('/roles/associate/') ? 'src/app/roles/associate/[roleSlug]/page.tsx' : path.join('src/app', href, 'page.tsx');
        expect(fs.existsSync(file), href).toBe(true);
      }
      expect(hrefs.some(href => /dashboard|coupon|news|\/auth/.test(href))).toBe(false);
      const geometry = await header.evaluate(element => {
        const shell = element.querySelector('.public-header-shell');
        const panel = element.querySelector('#public-page-directory');
        const rect = panel.getBoundingClientRect();
        const children = Array.from(shell.children).filter(child => getComputedStyle(child).display !== 'none').map(child => child.getBoundingClientRect());
        return { shellOverflow: shell.scrollWidth > shell.clientWidth, panelOverflow: panel.scrollWidth > panel.clientWidth, left: rect.left, right: rect.right, bottom: rect.bottom, overlaps: children.some((rect, i) => i > 0 && rect.left < children[i-1].right), columns: getComputedStyle(panel.querySelector('nav')).columnCount };
      });
      expect(geometry.shellOverflow).toBe(false);
      expect(geometry.panelOverflow).toBe(false);
      expect(geometry.overlaps).toBe(false);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      expect(geometry.bottom).toBeLessThanOrEqual(900);
      expect(geometry.columns).toBe(mobile ? '1' : '3');
      if (mobile) await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
      await page.screenshot({ path: testInfo.outputPath('menu-light.png') });
      await directory.getByRole('link', { name: 'Disclaimer', exact: true }).focus();
      await expect(directory.getByRole('link', { name: 'Disclaimer', exact: true })).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(page.locator('#public-page-directory')).toHaveCount(0);
      await expect(trigger()).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
      await trigger().click();
      await page.mouse.click(2, 880);
      await expect(page.locator('#public-page-directory')).toHaveCount(0);
      await trigger().click();
      await header.getByRole('button', { name: 'Toggle theme' }).filter({ visible: true }).click();
      await expect(page.locator('html')).toHaveClass(/dark/);
      await page.locator('#public-page-directory').evaluate(element => { element.scrollTop = 0; });
      await page.screenshot({ path: testInfo.outputPath('menu-dark.png') });
      await directory.getByRole('link', { name: 'About OBAOL', exact: true }).click();
      await expect(page.locator('#public-page-directory')).toHaveCount(0);
      await trigger().click();
      await page.setViewportSize({ width: mobile ? 1280 : 390, height: 900 });
      await expect(page.locator('#public-page-directory')).toHaveCount(0);
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    });
  }
}
