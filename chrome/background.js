// Same variable declarations
let urlToDownload = null;
let refererURL = null;
let filename = null;
DOMAIN = "https://istudy.ntut.edu.tw/*";
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!tab.url.startsWith("https://istudy.ntut.edu.tw/")) {
    SetIcon("waiting");
  }
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (!tab.url.startsWith("https://istudy.ntut.edu.tw/")) {
      SetIcon("waiting");
    }
  });
});
// Listening for a request to capture the referer URL
chrome.webRequest.onBeforeRequest.addListener(
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
    if (item.url.startsWith("blob:https://istudy.ntut.edu.tw"))
      suggest({ filename: filename + ".pdf" });
    else {
      suggest({ filename: item.filename });
    }
  },
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

function SetIcon(state) {
  if (state == "waiting") {
    idleIcons = {
      "16": "images/zzz_16.png",
      "32": "images/zzz_32.png",
      "64": "images/zzz_64.png",
      "128": "images/zzz_128.png"
    }
    chrome.browserAction.setIcon({ path: idleIcons });
  }
  else if (state == "downloadable") {
    okIcons = {
      "16": "images/ok_16.png",
      "32": "images/ok_32.png",
      "64": "images/ok_64.png",
      "128": "images/ok_128.png"
    }
    chrome.browserAction.setIcon({ path: okIcons });
  }
}
