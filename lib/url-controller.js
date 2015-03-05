// Generated by CoffeeScript 1.9.1
var Trie, crawledUrls, isRobotsCached, parser, redis, redisClient, robots, robotsAllowsUrl, urlHandler, urlOnBlacklist;

urlHandler = require('url');

robots = require('robots');

Trie = require('trie').Trie;

redis = require('redis');

redisClient = redis.createClient();

redisClient.on('error', function(err) {
  return console.log("redis error: " + err);
});

redisClient.select(1);

crawledUrls = new Trie();

parser = new robots.RobotsParser();

urlOnBlacklist = function(url) {
  var parsedUrl;
  parsedUrl = urlHandler.parse(url, true);
  if (parsedUrl.hostname === 'news.google.com' && parsedUrl.pathname === '/news/section' && (parsedUrl.query['q'] != null)) {
    return true;
  }
  return false;
};

isRobotsCached = function(robotsUrl) {
  return new Promise(function(resolve, reject) {
    return redisClient.get(robotsUrl, function(err, res) {
      if (err) {
        reject(err);
      }
      if (res) {
        return resolve(res);
      } else {
        return resolve(null);
      }
    });
  });
};

exports.crawlUrl = function(url) {
  return new Promise(function(resolve, reject) {
    console.log("start " + url);
    if (crawledUrls.lookup(url)) {
      return resolve(false);
    } else {
      crawledUrls.addWord(url);
    }
    if (urlOnBlacklist(url)) {
      return resolve(false);
    }
    return robotsAllowsUrl(url).then((function(allowed) {
      return resolve(allowed);
    }), (function(err) {
      return reject(err);
    }));
  });
};

robotsAllowsUrl = function(url) {
  return new Promise(function(resolve, reject) {
    var checkPathInRobots, homeDir, path, robotsTxtLocation, urlParts;
    urlParts = url.split('/');
    homeDir = urlParts[0] + "//" + urlParts[2] + "/";
    robotsTxtLocation = homeDir + "robots.txt";
    path = "/" + (urlParts.slice(3).join('/').split('?')[0]);
    checkPathInRobots = function(path) {
      return parser.canFetch('*', path, function(access) {
        return resolve(access ? true : false);
      });
    };
    isRobotsCached(robotsTxtLocation).then(function(cached) {
      if (cached) {
        return resolve(true);
      } else {
        return parser.setUrl(robotsTxtLocation, function(parser, success) {
          return resolve(true);
        });
      }
    });
  });
};