// Same variable declarations
let urlToDownload = null;
let refererURL = null;
let filename = null;
DOMAIN = "https://istudy.ntut.edu.tw/*";
// Listening for a request to capture the referer URL
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/viewPDF.php")) {
      refererURL = details.url;
    }
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/getPDF.php")) {
      urlToDownload = details.url;
      // file name start with id= ... end with .pdf
      filename = details.url.split("id=")[1].split(".pdf")[0];
    }
  },
  { urls: [DOMAIN] });

// Modifying request headers before a request is sent
browser.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.url === urlToDownload) {
      details.requestHeaders.push({ name: 'Referer', value: refererURL });
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: [DOMAIN] },
  ["blocking", "requestHeaders"]
);



// Reacting to a browser action click
browser.browserAction.onClicked.addListener(function (tab) {
  if (urlToDownload) {
    // direct download
    browser.downloads.download({
      url: urlToDownload,
      filename: filename + ".pdf",
      conflictAction: "uniquify",
    });
  }
});
