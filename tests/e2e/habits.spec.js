import { test, expect } from '@playwright/test';

test.describe('Habit Tracker', () => {
    test('loads and shows habits', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Hábitos');
        await expect(page.locator('.habit')).toHaveCount(4, { timeout: 10000 });
    });

    test('can toggle a habit', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.habit', { timeout: 10000 });
        const firstHabit = page.locator('.habit').first();
        await firstHabit.click();
        await expect(firstHabit).toHaveClass(/done/);
        await firstHabit.click();
        await expect(firstHabit).not.toHaveClass(/done/);
    });

    test('can navigate days', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.habit', { timeout: 10000 });
        await page.click('#prevDay');
        await expect(page.locator('#todayBadge')).toHaveCSS('display', 'none');
        await page.click('#nextDay');
        await expect(page.locator('#todayBadge')).not.toHaveCSS('display', 'none');
    });

    test('can add a new habit', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.habit', { timeout: 10000 });
        const initialCount = await page.locator('.habit').count();
        await page.fill('#addHabitInput', 'Test habit');
        await page.click('#addHabitBtn');
        await expect(page.locator('.habit')).toHaveCount(initialCount + 1);
    });

    test('theme toggle works', async ({ page }) => {
        await page.goto('/');
        const html = page.locator('html');
        await expect(html).toHaveAttribute('data-theme', 'dark');
        await page.click('#themeToggle');
        await expect(html).toHaveAttribute('data-theme', 'light');
        await page.click('#themeToggle');
        await expect(html).toHaveAttribute('data-theme', 'dark');
    });

    test('stats are visible', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.stat-number', { timeout: 10000 });
        await expect(page.locator('#currentStreak')).toBeVisible();
        await expect(page.locator('#bestStreak')).toBeVisible();
        await expect(page.locator('#completionPct')).toBeVisible();
    });
});