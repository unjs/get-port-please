import { describe, test, expect } from "vitest";
import { isSocketSupported, getSocketAddress } from "../src";

describe("socket", () => {
  test("isSocketSupported", async () => {
    expect(await isSocketSupported()).toBe(true);
  });
  test("getSocketAddress", async () => {
    const addr = getSocketAddress({ name: "test", pid: true, random: true });
    expect(addr).toMatch(/test-\d+-\d+\.sock/);
  });
});
