const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { createDatabase } = require("../src/database");

let app;
let database;
let server;
let baseUrl;

before(async () => {
  database = createDatabase(":memory:");
  app = createApp({ database });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  database.close();
});

test("creates a short URL and redirects to the original URL", async () => {
  const createResponse = await fetch(`${baseUrl}/api/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com/a/long/path?x=1" })
  });

  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.match(created.shortCode, /^[A-Za-z0-9_-]{7}$/);
  assert.equal(created.shortUrl, `${baseUrl}/${created.shortCode}`);
  assert.equal(created.originalUrl, "https://example.com/a/long/path?x=1");

  const redirectResponse = await fetch(created.shortUrl, { redirect: "manual" });
  assert.equal(redirectResponse.status, 302);
  assert.equal(redirectResponse.headers.get("location"), created.originalUrl);
});

test("rejects URLs that do not use HTTP or HTTPS", async () => {
  const response = await fetch(`${baseUrl}/api/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "javascript:alert(1)" })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Enter a valid URL beginning with http:// or https://."
  });
});

test("returns 404 for unknown short codes", async () => {
  const response = await fetch(`${baseUrl}/not-a-real-code`, { redirect: "manual" });
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Short URL not found.");
});

test("serves the frontend", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Make links/);
});
