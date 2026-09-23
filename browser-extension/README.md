# Growth Inspector Browser Bridge

This is a Chrome/Edge Manifest V3 extension for the Growth Inspector workspace.

## Install locally

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `browser-extension` folder.
4. Sign in to Growth Inspector in the same browser.
5. Open the extension and select an admin-approved app.

The extension only opens the fixed approved app URLs and checks `/api/agent/browser` before opening them. It does not read passwords, cookies, tokens, or page contents. Computer-level actions are intentionally confirmation-gated and are not silently executed.
