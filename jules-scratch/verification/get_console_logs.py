import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Listen for all console events and print their text
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        await page.goto("http://localhost:3000")

        # Wait for a specific element to ensure the page has tried to load
        # Or just wait for a timeout if the page is completely blank
        try:
            await page.wait_for_selector('body > *', timeout=5000)
        except Exception:
            print("Page appears to be blank.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
