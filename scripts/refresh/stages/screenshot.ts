/**
 * Stage 4: Re-capture product screenshots via Playwright.
 */
import { execSync } from "child_process";
import path from "path";
import type { PipelineConfig } from "../config.js";

export async function captureScreenshots(
  config: PipelineConfig,
  targetSlugs?: string[]
): Promise<{ captured: number; errors: string[] }> {
  if (!config.screenshotsEnabled) {
    console.log("  [screenshots] Disabled, skipping");
    return { captured: 0, errors: [] };
  }

  console.log("  [screenshots] Capturing product screenshots...");

  // Write a temporary Python script (Playwright is installed as Python package)
  const scriptPath = path.resolve("scripts/refresh/_screenshot_worker.py");
  const script = buildScreenshotScript(config, targetSlugs);

  const fs = await import("fs");
  fs.writeFileSync(scriptPath, script);

  try {
    const output = execSync(`python3 ${scriptPath}`, {
      timeout: 300000, // 5 min max
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    console.log(output);

    const captured = (output.match(/SAVED/g) || []).length;
    return { captured, errors: [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { captured: 0, errors: [msg] };
  } finally {
    try { fs.unlinkSync(scriptPath); } catch {}
  }
}

function buildScreenshotScript(config: PipelineConfig, targetSlugs?: string[]): string {
  const slugFilter = targetSlugs ? `TARGETS = ${JSON.stringify(targetSlugs)}` : "TARGETS = None";

  return `#!/usr/bin/env python3
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

COMPANIES_DIR = "${config.companiesDir}"
SCREENSHOTS_DIR = "${config.screenshotsDir}"
${slugFilter}

def main():
    files = sorted(Path(COMPANIES_DIR).glob("*.json"))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for f in files:
            slug = f.stem
            if TARGETS and slug not in TARGETS:
                continue
            data = json.loads(f.read_text())
            website = data.get("website", "")
            steps = data.get("walkthrough", {}).get("steps", [])
            if not website or not steps:
                continue

            out_dir = Path(SCREENSHOTS_DIR) / slug
            out_dir.mkdir(parents=True, exist_ok=True)

            ctx = browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )
            page = ctx.new_page()
            try:
                page.goto(website, wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(3000)
                # Dismiss popups
                for sel in ['button:has-text("Accept")', 'button:has-text("Close")', '#onetrust-accept-btn-handler']:
                    try:
                        btn = page.locator(sel).first
                        if btn.is_visible(timeout=400):
                            btn.click(timeout=1000)
                            page.wait_for_timeout(300)
                            break
                    except: pass

                ph = page.evaluate("document.body.scrollHeight")
                n = len(steps)
                for i in range(n):
                    sy = int((i / max(n - 1, 1)) * max(0, ph - 900))
                    page.evaluate(f"window.scrollTo({{top: {sy}, behavior: 'instant'}})")
                    page.wait_for_timeout(600)
                    sp = out_dir / f"step-{i+1}.png"
                    page.screenshot(path=str(sp), type="png")
                    print(f"  SAVED {slug}/step-{i+1}.png")

                # Update JSON with image paths
                changed = False
                for i, step in enumerate(steps):
                    img = f"/screenshots/{slug}/step-{i+1}.png"
                    full = out_dir / f"step-{i+1}.png"
                    if full.exists() and step.get("image") != img:
                        step["image"] = img
                        changed = True
                if changed:
                    f.write_text(json.dumps(data, indent=2) + "\\n")

            except Exception as e:
                print(f"  ERROR {slug}: {e}")
            finally:
                ctx.close()
        browser.close()

if __name__ == "__main__":
    main()
`;
}
