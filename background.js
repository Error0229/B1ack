function readHeader(e) {
  if (e.url.startsWith("https://istudy.ntut.edu.tw/learn/path/getPDF.php")) {
    console.log(e);
    console.log(e.requestHeaders);
    // save the 
  }
}
chrome.webRequest.onSendHeaders.addListener(readHeader, {
  urls: ["<all_urls>"],

}, ["requestHeaders", "extraHeaders"]);
