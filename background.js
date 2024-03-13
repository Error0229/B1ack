// Same variable declarations
let urlToDownload = null;
let refererURL = null;
let filename = null;
DOMAIN = "https://istudy.ntut.edu.tw/*";
// Listening for a request to capture the referer URL
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/viewPDF.php")) {
      refererURL = details.url;
      console.log("Referer URL:", refererURL);
    }
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/getPDF.php")) {
      urlToDownload = details.url;
      // file name start with id= ... end with .pdf
      filename = details.url.split("id=")[1].split(".pdf")[0];
      console.log("Url to download:", urlToDownload);
      console.log("Filename:", filename);
    }
  },
  { urls: [DOMAIN] });

// Modifying request headers before a request is sent
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.url === urlToDownload) {
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Referer') {
          details.requestHeaders[i].value = refererURL;
          break;
        }
      }
      return { requestHeaders: details.requestHeaders };
    }
  },
  { urls: [DOMAIN] },
  ["blocking", "requestHeaders", "extraHeaders"]
);

// override filename
chrome.downloads.onDeterminingFilename.addListener(
  function (item, suggest) {
    suggest({ filename: filename + ".pdf" });
  }
)

// Reacting to a browser action click
chrome.browserAction.onClicked.addListener(function (tab) {
  if (urlToDownload) {
    chrome.tabs.sendMessage(tab.id, { url: urlToDownload }, function (response) {
      chrome.downloads.download({
        url: response.url,
        conflictAction: "uniquify",
      });
    });
  }
});
