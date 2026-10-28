import { afterEach, describe, expect, it } from "vitest";
import { developerMessage, sentTtl } from "../../src/models/cached-instructions.js";
import { cachedDeveloperItem } from "../../src/models/prompt-cache.js";

// Azure OpenAI keeps cache writes only 30 minutes and refuses `12h` with a 400.
describe("POMERADO_PROMPT_CACHE_MAX_TTL", () => {
  afterEach(() => {
    delete process.env["POMERADO_PROMPT_CACHE_MAX_TTL"];
  });

  it("sends the requested lifetime when unset", () => {
    expect(sentTtl("12h")).toBe("12h");
    expect(sentTtl("30m")).toBe("30m");
  });

  it("caps every breakpoint at 30m when set to 30m", () => {
    process.env["POMERADO_PROMPT_CACHE_MAX_TTL"] = "30m";
    expect(sentTtl("12h")).toBe("30m");
    const message = JSON.stringify(developerMessage({ text: "x", breakpoint: "12h" }));
    const item = JSON.stringify(cachedDeveloperItem(["x"], "12h"));
    expect(message).toContain('"ttl":"30m"');
    expect(item).toContain('"ttl":"30m"');
    expect(message + item).not.toContain("12h");
  });
});
