import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:3000/register")

        # Wait for a specific interactive element to be ready
        await page.wait_for_selector('input[name="firstName"]')

        await page.fill('input[name="firstName"]', 'Manual')
        await page.fill('input[name="lastName"]', 'Landlord')
        await page.fill('input[name="email"]', 'landlord@manualtest.com')
        await page.fill('input[name="password"]', 'password123')
        await page.select_option('select[name="role"]', 'OWNER')

        await page.click('button[type="submit"]')

        await page.wait_for_url("http://localhost:3000/")

        await page.screenshot(path="manual_test_01_landlord_registered.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
