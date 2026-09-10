// Background service worker for Pretext extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pretext Typography Extension installed');
});

// Relay messages if needed
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PAGE_INFO') {
    // Forward to popup if it's open
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
});
