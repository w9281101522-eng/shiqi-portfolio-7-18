import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished portfolio shell and core content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /王诗琦｜UX \/ UI 设计师作品集/);
  assert.match(html, /Shiqi Wang/);
  assert.match(html, /我想和你分享一张设计便签/);
  assert.match(html, /中国移动炫彩通话/);
  assert.match(html, /蘑菇丁 APP 改版/);
  assert.match(html, /喵小甜 IP 全流程设计/);
  assert.match(html, /3619554001@qq\.com/);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape/);
});
