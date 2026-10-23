const path = require("node:path");
const { createApp } = require("./app");
const { createDatabase } = require("./database");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const publicBaseUrl = process.env.PUBLIC_BASE_URL;
const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : undefined;
const database = createDatabase(databasePath);
const app = createApp({ database, publicBaseUrl });

const server = app.listen(port, () => {
  console.log(`URL shortener is running at http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
