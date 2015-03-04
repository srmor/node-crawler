urlHandler = require 'url'
robots = require 'robots'
{ Trie } = require 'trie'
redis = require 'redis'

redisClient = redis.createClient()

redisClient.on 'error', (err) ->
  console.log("redis error: #{ err }")

redisClient.select 1

crawledUrls = new Trie()
parser = new robots.RobotsParser()

urlOnBlacklist = (url) ->
  parsedUrl = urlHandler.parse url, true

  if parsedUrl.hostname == 'news.google.com' and parsedUrl.pathname == '/news/section' and parsedUrl.query['q']?
    return true

  return false


isRobotsCached = (robotsUrl) ->
  return new Promise (resolve, reject) ->
    redisClient.get robotsUrl, (err, res) ->
      if err
        reject err

      if res
        resolve res
      else
        resolve null


exports.crawlUrl = (url) ->
  new Promise (resolve, reject) ->
    # check if the URL has been crawled yet
    if crawledUrls.lookup url
      return resolve false
    else
      crawledUrls.addWord url

    # check if the URL is on the blacklist
    return resolve(false) if urlOnBlacklist url

    # check if website's robots.txt allows the URL to be crawled
    robotsAllowsUrl url
    .then ((allowed) -> resolve(allowed)), ((err) -> reject(err))


robotsAllowsUrl = (url) ->
  new Promise (resolve, reject) ->
    urlParts = url.split '/'
    homeDir = "#{ urlParts[0] }//#{ urlParts[2] }/"
    robotsTxtLocation = "#{ homeDir }robots.txt"

    path = "/#{ urlParts.slice(3).join('/').split('?')[0] }"

    checkPathInRobots = (path) ->
      parser.canFetch('*', path, (access) ->
        return resolve if access then true else false
      )

    isRobotsCached(robotsTxtLocation)
    .then (cached) ->
      if cached
        parser.readString cached
        checkPathInRobots path
      else
        parser.setUrl robotsTxtLocation, (parser, success) ->
          if success
            redisClient.set robotsTxtLocation, parser.rawData
            checkPathInRobots path
          else
            return resolve true

    return
