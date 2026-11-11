// Computes a reading-time estimate for an article URL from its actual text,
// instead of a hand-typed guess. Run with: npm run estimate -- <url> [<url> ...]
//
// Why two speeds: a wall of prose reads faster than a wall with embedded code.
// Code-block characters are counted separately and charged at a slower rate
// (close to line-by-line comprehension speed) instead of word-count speed.

import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const PROSE_WPM = 220;
const CODE_CHARS_PER_MIN = 500;

// Below this, a plain fetch is more likely to have caught a JS-rendered app
// shell than a genuinely short article. Flag it instead of guessing.
const LOW_CONFIDENCE_WORD_THRESHOLD = 600;

async function estimate(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BeyondReadingTimeBot/1.0)" },
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article?.content) throw new Error(`${url} -> Readability could not extract article content`);

  const articleDom = new JSDOM(article.content);
  const codeNodes = Array.from(articleDom.window.document.querySelectorAll("pre, code"));
  const codeChars = codeNodes.reduce((sum, node) => sum + (node.textContent?.length ?? 0), 0);

  // Remove code text from the prose body so it isn't double counted at the wrong speed.
  codeNodes.forEach((node) => node.remove());
  const proseText = articleDom.window.document.body.textContent ?? "";
  const proseWords = proseText.trim().split(/\s+/).filter(Boolean).length;

  const proseMinutes = proseWords / PROSE_WPM;
  const codeMinutes = codeChars / CODE_CHARS_PER_MIN;
  const totalMinutes = Math.max(1, Math.round(proseMinutes + codeMinutes));
  const lowConfidence = proseWords < LOW_CONFIDENCE_WORD_THRESHOLD;

  return { url, title: article.title, proseWords, codeChars, totalMinutes, lowConfidence };
}

async function main() {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.error("Usage: npm run estimate -- <url> [<url> ...]");
    process.exit(1);
  }

  for (const url of urls) {
    try {
      const result = await estimate(url);
      console.log(`\n${result.title ?? url}`);
      console.log(`  ${result.proseWords} words, ${result.codeChars} code chars`);
      console.log(`  est_minutes = ${result.totalMinutes}`);
      if (result.lowConfidence) {
        console.log(
          "  LOW CONFIDENCE: word count is low enough that this may be a JS-rendered page " +
            "(the fetch only sees the app shell, not the real content). Open the page and check " +
            "before trusting this number."
        );
      }
    } catch (err) {
      console.error(`\n${url}\n  FAILED: ${(err as Error).message}`);
    }
  }
}

main();
