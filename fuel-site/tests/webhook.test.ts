import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "../src/app/api/telegram/route";
import { parseIdList, safeEqual } from "../src/lib/security";

const URL = "http://localhost/api/telegram";

function request(body: unknown, secret?: string) {
  return new Request(URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(secret === undefined ? {} : { "x-telegram-bot-api-secret-token": secret }),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("security helpers", () => {
  it("compares secrets exactly", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });

  it("parses id lists and drops junk", () => {
    expect([...parseIdList("123, 456,abc, 7.5,,-100500")]).toEqual([123, 456, -100500]);
    expect(parseIdList(undefined).size).toBe(0);
  });
});

describe("POST /api/telegram", () => {
  const saved = process.env.TELEGRAM_WEBHOOK_SECRET;
  beforeEach(() => {
    process.env.TELEGRAM_WEBHOOK_SECRET = "test-secret";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.TELEGRAM_WEBHOOK_SECRET;
    else process.env.TELEGRAM_WEBHOOK_SECRET = saved;
  });

  it("rejects a missing or wrong secret", async () => {
    expect((await POST(request({ update_id: 1 }))).status).toBe(401);
    expect((await POST(request({ update_id: 1 }, "wrong"))).status).toBe(401);
  });

  it("rejects everything when no secret is configured", async () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    expect((await POST(request({ update_id: 1 }, ""))).status).toBe(401);
  });

  it("rejects malformed bodies after authentication", async () => {
    expect((await POST(request("not json", "test-secret"))).status).toBe(400);
    expect((await POST(request({ foo: 1 }, "test-secret"))).status).toBe(400);
  });
});
