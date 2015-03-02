var kue = require('kue');
var crawler = require('./crawl-page');
var trie = require('trie');
var robots = require('robots');
var urlHandler = require('url');

var parser = new robots.RobotsParser();

var visitedUrls = new trie.Trie();

var jobs = kue.createQueue();

var requests = 0;
var minutesElapsed = 0;

setInterval(function() {
  minutesElapsed++;
  console.log(requests + ' requests in ' + minutesElapsed + ' minutes');
}, 60000);

var addUrlToKue = function (parentUrl, url, datetime, callback) {
  jobs.create('url', {
    title: url,
    url: url,
    parent: parentUrl,
    datetime: Date.now()
  }).save(function (err) {
    if (err)
      return callback(err);
  });
};

var urlOnBlacklist = function (url) {
  var parsedUrl = urlHandler.parse(url, true);
  if (parsedUrl.hostname === 'news.google.com' && parsedUrl.pathname === '/news/section' && parsedUrl.query['q'] === undefined) {
    return true;
  }
  return false;
};

// add seed to kue
var seedUrl = 'https://news.google.com/news/directory';

jobs.create('url', {
  title: seedUrl,
  url: seedUrl,
  datetime: Date.now()
}).save(function (err) {
  if (err)
    return console.log(err);

  visitedUrls.addWord(seedUrl);
});


// process the urls on  kue
jobs.process('url', function(job, done) {
  var seed = new crawler.Url(job.data.url);

  crawler.crawl(seed, function(err, urls) {
    if (err)
      return done();

    urls.forEach(function(url) {
      if (!visitedUrls.lookup(url)) {
        visitedUrls.addWord(url);

        if (urlOnBlacklist(url))
          return;

        var urlParts = url.split('/');
        var homeDir = urlParts[0] + '//' + urlParts[2] + '/';
        var robotsTxtLocation = homeDir + 'robots.txt';

        // remove the query parameters for now for better matching
        var path = '/' + urlParts.slice(3).join('/').split('?')[0];

        parser.setUrl(robotsTxtLocation, function(parser, success) {
          requests++;

          if (success) {
            // if the URL has a robots.txt then parse check it
            parser.canFetch('*', path, function (access) {
              if (access) {
                addUrlToKue(seed.baseUrl, url, Date.now(), function(err){
                  console.log(err);
                });
              }
            });
          }
          else {
            addUrlToKue(seed.baseUrl, url, Date.now(), function(err){
              console.log(err);
            });
          }
        })
      }
    });
    done();
  });
});
