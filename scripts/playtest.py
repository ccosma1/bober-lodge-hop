"""Phone UI and bank-bot check for Bober Burrow Hop."""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8793/?v=lh14"
OUT = Path(__file__).resolve().parents[1] / "docs" / "lh1"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.set_default_timeout(300000)
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(URL, wait_until="networkidle")
        page.wait_for_function("() => window.__hop && window.__hop.build === 'lh14'")
        result = page.evaluate("() => window.__hop.selfTest()")
        (OUT / "selftest.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result["report"]))
        page.click("#btn-play")
        page.wait_for_selector("#screen-map:not([hidden])")
        page.screenshot(path=str(OUT / "map-390.png"))
        page.click("#map-list button.next")
        page.wait_for_function("() => document.body.dataset.mode === 'play'")
        page.wait_for_function("() => !document.getElementById('reel').hidden", timeout=5000)
        page.wait_for_function(
            "() => { const v = document.getElementById('reel-video'); return v.videoWidth === 720 && v.currentTime > 0; }",
            timeout=8000,
        )
        page.screenshot(path=str(OUT / "reel-390.png"))
        page.click("#btn-reel-skip")
        page.wait_for_function("() => document.getElementById('reel').hidden")
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
        page.evaluate("() => window.__hop.start('2-1')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().x > 420", timeout=20000)
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / "mill-390.png"))
        page.evaluate("() => window.__hop.start('3-1')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().x > 1520", timeout=45000)
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / "duck-390.png"))
        page.evaluate("() => window.__hop.start('4-1')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().x > 700", timeout=25000)
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / "cedar-390.png"))
        page.evaluate("() => window.__hop.start('5-1')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().x > 700", timeout=25000)
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / "goose-390.png"))
        page.evaluate("() => window.__hop.start('9-1')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().x > 700", timeout=25000)
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / "mason-390.png"))
        page.evaluate("() => window.__hop.setBot(false)")
        page.click("#btn-pause")
        page.click("#btn-quit")
        page.wait_for_selector("#screen-map:not([hidden])")
        page.evaluate("() => window.__hop.start('10-2')")
        page.evaluate("() => window.__hop.setBot(true)")
        page.wait_for_function("() => window.__hop.snapshot().mode === 'clearing'", timeout=30000)
        page.evaluate("() => window.__hop.setBot(false)")
        page.wait_for_function(
            "() => { const v = document.getElementById('reel-video'); return !document.getElementById('reel').hidden && v.currentSrc.indexOf('end.mp4') >= 0 && v.videoWidth === 720 && v.currentTime > 0; }",
            timeout=8000,
        )
        page.screenshot(path=str(OUT / "reel-end-390.png"))
        page.click("#btn-reel-skip")
        page.wait_for_function("() => document.getElementById('reel').hidden && window.__hop.snapshot().card === 'end'")
        page.click("#btn-end-map")
        page.wait_for_selector("#screen-map:not([hidden])")
        page.click("#btn-map-title")
        page.click("#btn-notes")
        notes = page.inner_text("#screen-notes")
        if "lh14" not in notes or "Unofficial" not in notes or "No wallet" not in notes:
            errors.append("notes missing fan line or build")
        page.click("#btn-notes-back")
        page.click("#btn-story")
        page.wait_for_selector("#screen-story:not([hidden])")
        story = page.inner_text("#story-title")
        if "quiet" not in story.lower():
            errors.append("story title")
        page.screenshot(path=str(OUT / "story-390.png"))
        page.click("#btn-story-next")
        if "carried" not in page.inner_text("#story-title").lower() and "what" not in page.inner_text("#story-title").lower():
            errors.append("story next")
        page.click("#btn-story-back")
        page.wait_for_selector("#screen-title:not([hidden])")
        page.click("#btn-museum")
        page.wait_for_selector("#museum-grid button")
        page.screenshot(path=str(OUT / "museum-390.png"))
        page.click("#museum-grid button")
        page.wait_for_selector("#screen-plate:not([hidden])")
        if page.inner_text("#plate-name").strip() != "Bober":
            errors.append("plate")
        page.screenshot(path=str(OUT / "plate-390.png"))
        page.click("#btn-plate-back")
        page.click("#btn-museum-back")
        page.wait_for_selector("#screen-title:not([hidden])")
        page.set_viewport_size({"width": 1440, "height": 900})
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
