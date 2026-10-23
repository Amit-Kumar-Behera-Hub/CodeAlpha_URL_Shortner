# Linklet URL Shortener

A small URL shortener built with Node.js, Express, and SQLite. It includes a browser interface, stores links in a local SQLite database, and redirects short links to their original URLs.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```powershell
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). SQLite data is stored in `data/urls.sqlite` and remains available after restarting the server.

For automatic restarts during development:

```powershell
npm run dev
```

## API

### Create a short URL

`POST /api/urls`

Request:

```json
{
  "url": "https://example.com/a/long/path"
}
```

Success response (`201 Created`):

```json
{
  "shortCode": "Ab3dEfG",
  "originalUrl": "https://example.com/a/long/path",
  "createdAt": "2026-10-23 00:00:00",
  "shortUrl": "http://localhost:3000/Ab3dEfG"
}
```

Only `http://` and `https://` URLs are accepted. Invalid input returns `400 Bad Request`.

### Follow a short URL

Open `GET /:code` in a browser. A saved code responds with a `302` redirect to the original URL; an unknown code returns `404`.

## Configuration

- `PORT`: server port (default: `3000`)
- `DATABASE_PATH`: SQLite file path (default: `data/urls.sqlite`)
- `PUBLIC_BASE_URL`: optional public origin used when generating short URLs, such as `https://sho.rt`

## Tests

```powershell
npm test
```
