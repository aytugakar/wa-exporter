chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_CONTACTS") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("page-script.js");
    (document.head || document.documentElement).appendChild(script);

    const handleMessage = (event) => {
      if (event.source !== window || event.data.type !== "WA_EXTRACT_RESULT") return;
      window.removeEventListener("message", handleMessage);
      script.remove();
      sendResponse(event.data);
    };

    window.addEventListener("message", handleMessage);
    return true;
  }
});
