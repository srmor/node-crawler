var req = require('request');

exports.Url = function (baseUrl) {
  this.baseUrl = baseUrl;
  this.protocol = getCurProtocol(baseUrl);

  function getCurProtocol(baseUrl) {
    if (baseUrl.substr(0, 7) === 'http://') {
      return "http";
    }
    else {
      return "https";
    }
  }
};

exports.crawl = function (seedSite, callback) {
  var urls = [];
  req(seedSite.baseUrl, function(err, res, body) {
    if (err)
      return callback(err);

    var re = /<a[^>]*href="([^"]*)"[^>]*>/g;
    var curVal;
    while ((curVal = re.exec(body)) != null) {
      var curUrl = curVal[1];
      var normalizedUrl = createFullUrl.call(seedSite, curUrl);

      // don't crawl URLs with hashes of the current page
      var hashBaseUrlRegex = new RegExp(seedSite.baseUrl + '#' + '[^/]*$');
      if (!hashBaseUrlRegex.test(normalizedUrl) && curUrl.substr(0, 7) !== 'mailto:') {
        urls.push(normalizedUrl);
      }
    }

    return callback(null, urls);
  });
};

function createFullUrl(url) {
  if (url.substr(0, 7) === 'http://' || url.substr(0, 8) === 'https://') {
    return url;
  }
  else if (url.substr(0, 2) === '//') {
    return this.protocol + '://' + url.substring(2);
  }
  else if (url.substr(0, 1) === '/') {
    var urlParts = this.baseUrl.split('/');
    return urlParts[0] + '//' + urlParts[2] + url;
  }
  else {
    var urlLen = this.baseUrl.length;
    if (this.baseUrl[urlLen - 1] === '/') {
      return this.baseUrl + url;
    }
    else {
      var parts = this.baseUrl.split('/');
      parts.pop();
      return parts.join('/') + '/' + url;
    }
  }
}