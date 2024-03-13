(function() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('Fetching:', args);
    return originalFetch.apply(this, args).then(response => {
      if (response.url.startsWith('https://istudy.ntut.edu.tw/learn/path/getPDF.php')) {
        console.log('Data received from fetch:', response.url);
        response.clone().text().then(content => {
          // Send the response content to the background script
          chrome.runtime.sendMessage({url: response.url, data: content});
        });
      }
      return response;
    });
  };
})();
