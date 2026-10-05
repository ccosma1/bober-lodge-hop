"""Phone UI and bank-bot check for Bober Lodge Hop."""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8793/?v=lh1"
OUT = Path(__file__).resolve().parents[1] / "docs" / "lh1"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.set_default_timeout(120000)
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(URL, wait_until="networkidle")
        page.wait_for_function("() => window.__hop && window.__hop.build === 'lh1'")
        result = page.evaluate("() => window.__hop.selfTest()")
        (OUT / "selftest.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result["report"]))
        page.click("#btn-play")
        page.wait_for_selector("#screen-map:not([hidden])")
        page.screenshot(path=str(OUT / "map-390.png"))
        page.click("#map-list button.next")
        page.wait_for_function("() => document.body.dataset.mode === 'play'")
        page.wait_for_timeout(400)
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_timeout(1400)
        page.screenshot(path=str(OUT / "play-390.png"))
        page.evaluate("() => window.__hop.setBot(false)")
        page.click("#btn-pause")
        page.wait_for_selector("#card-pause:not([hidden])")
        page.screenshot(path=str(OUT / "pause-390.png"))
        page.click("#btn-resume")
        page.wait_for_function("() => document.body.dataset.card === ''")
        page.evaluate("() => window.__hop.start('3-2')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_timeout(1600)
        page.screenshot(path=str(OUT / "boss-390.png"))
        page.evaluate("() => window.__hop.setBot(false)")
        page.click("#btn-pause")
        page.click("#btn-quit")
        page.wait_for_selector("#screen-map:not([hidden])")
        page.click("#btn-map-title")
        page.click("#btn-notes")
        notes = page.inner_text("#screen-notes")
        if "lh1" not in notes or "Unofficial" not in notes or "No wallet" not in notes:
            errors.append("notes missing fan line or build")
        page.set_viewport_size({"width": 1440, "height": 900})
        page.click("#btn-notes-back")
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT / "title-1440.png"))
        browser.close()
    if result["fails"]:
        print("SELFTEST_FAIL")
        sys.exit(1)
    if errors:
        print("PAGEERRORS", errors)
        sys.exit(1)
    print("PLAYTEST_OK")


if __name__ == "__main__":
    main()
