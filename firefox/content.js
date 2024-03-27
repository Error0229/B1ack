// content.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    fetch(message.url, {
        credentials: 'include'
    })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            sendResponse({ url });
        });
    return true;  // Will respond asynchronously.
});
