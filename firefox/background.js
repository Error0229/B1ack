// Same variable declarations
let urlToDownload = null;
let refererURL = null;
let filename = null;
DOMAIN = "https://istudy.ntut.edu.tw/*";
function SetIcon(state) {
  if (state == "waiting") {
    idleIcons = {
      "16": "images/zzz_16.png",
      "32": "images/zzz_32.png",
      "64": "images/zzz_64.png",
      "128": "images/zzz_128.png"
    }
    browser.browserAction.setIcon({ path: idleIcons });
  }
  else if (state == "downloadable") {
    okIcons = {
      "16": "images/ok_16.png",
      "32": "images/ok_32.png",
      "64": "images/ok_64.png",
      "128": "images/ok_128.png"
    }
    browser.browserAction.setIcon({ path: okIcons });
  }
}

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!tab.url.startsWith("https://istudy.ntut.edu.tw/")) {
    SetIcon("waiting");
  }
});
browser.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (!tab.url.startsWith("https://istudy.ntut.edu.tw/")) {
      SetIcon("waiting");
    }
  });
});
// Listening for a request to capture the referer URL
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/viewPDF.php")) {
      refererURL = details.url;
      SetIcon("waiting");
    }
    if (details.url.startsWith("https://istudy.ntut.edu.tw/learn/path/getPDF.php")) {
      urlToDownload = details.url;
      // file name start with id= ... end with .pdf
      filename = details.url.split("id=")[1].split(".pdf")[0];
      SetIcon("downloadable");
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
