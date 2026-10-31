# OBAOL Supreme Desktop

Electron shell for the live OBAOL Supreme web application. It opens `https://www.obaol.com/auth`, keeps the authenticated session in Electron's persistent session, and remains available in the system tray for live notifications.

## Development

```bash
cd desktop
npm install
npm start
```

Override the live URL for local testing:

```bash
OBAOL_DESKTOP_URL=http://localhost:3000/auth npm start
```

Local HTTP is intentionally intended for development only. Production navigation is restricted to HTTPS OBAOL domains.

## Packaging

```bash
npm run validate
npm run dist:mac
npm run dist:win
```

macOS universal builds must run on macOS. Windows x64 builds run on the Windows GitHub Actions runner. Release tags use `desktop-v<version>`, for example `desktop-v0.1.0`.

Initial packages are unsigned beta builds. Windows SmartScreen and macOS Gatekeeper may warn users until signing credentials are configured.
