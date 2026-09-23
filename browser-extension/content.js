// The bridge deliberately does not read passwords, cookies, tokens, or page
// contents. It only reports the current approved host to the extension popup.
chrome.runtime.sendMessage({ type: "bridge-ready", host: location.hostname });

if (location.hostname === "growth-inspector.vercel.app") {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "get-browser-policy") return false;
    fetch("/api/agent/browser", { credentials: "include", cache: "no-store" })
      .then(async (response) => { const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.error || "Sign in to Growth Inspector first."); return data; })
      .then((data) => sendResponse({ ok: true, ...data }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  });
}
