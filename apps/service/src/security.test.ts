import { describe, expect, it } from "vitest";
import { assertPublicUrl, isPrivateAddress } from "./security.js";

describe("URL security", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.2", "169.254.169.254", "::1", "fd00::1"])("blocks private address %s", (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("accepts public address %s", (ip) => {
    expect(isPrivateAddress(ip)).toBe(false);
  });
  it.each(["file:///etc/passwd", "http://localhost/", "http://127.0.0.1/", "http://example.com:3000/"])("rejects %s", async (url) => {
    await expect(assertPublicUrl(url)).rejects.toThrow();
  });
});
