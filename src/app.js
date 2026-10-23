const { randomBytes } = require("node:crypto");
const express = require("express");
const path = require("node:path");

const CODE_LENGTH = 7;
const MAX_CODE_ATTEMPTS = 5;

function validateUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function createApp({ database, publicBaseUrl } = {}) {
  if (!database) {
    throw new Error("A database must be provided to createApp.");
  }

  const app = express();
  app.use(express.json({ limit: "10kb" }));

  app.post("/api/urls", (req, res) => {
    const originalUrl = validateUrl(req.body?.url);
    if (!originalUrl) {
      return res.status(400).json({
        error: "Enter a valid URL beginning with http:// or https://."
      });
    }

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const shortCode = randomBytes(6).toString("base64url").slice(0, CODE_LENGTH);
      try {
        const record = database.create(originalUrl, shortCode);
        const baseUrl = publicBaseUrl || `${req.protocol}://${req.get("host")}`;
        return res.status(201).json({
          ...record,
          shortUrl: `${baseUrl.replace(/\/+$/, "")}/${record.shortCode}`
        });
      } catch (error) {
        if (error.code !== "SQLITE_CONSTRAINT_PRIMARYKEY" && error.code !== "SQLITE_CONSTRAINT") {
          throw error;
        }
      }
    }

    return res.status(503).json({ error: "Could not create a unique short URL. Please try again." });
  });

  app.get("/:code", (req, res, next) => {
    const record = database.findByCode(req.params.code);
    if (!record) {
      return next();
    }
    return res.redirect(302, record.originalUrl);
  });

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found." });
    }
    return res.status(404).send("Short URL not found.");
  });

  return app;
}

module.exports = { createApp, validateUrl };
