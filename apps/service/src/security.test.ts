import { describe, expect, it } from "vitest";
import { assertPublicUrl, assertYoutubeVideoUrl, isPrivateAddress } from "./security.js";

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

describe("YouTube URL validation", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=2", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
  ])("normalizes %s", (input, expected) => expect(assertYoutubeVideoUrl(input)).toBe(expected));

  it.each([
    "https://www.youtube.com/playlist?list=PL123",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123",
    "https://www.youtube.com/channel/abc",
    "https://evil.example/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=bad",
  ])("rejects %s", (input) => expect(() => assertYoutubeVideoUrl(input)).toThrow());
});
