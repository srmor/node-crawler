req = require 'request'
urlHandler = require 'url'

class Url
  constructor: (@baseUrl) ->
    @protocol = @getCurProtocol(@baseUrl)

  getCurProtocol: (baseUrl) ->
    if baseUrl.substr(0, 7) == 'http://'
      return 'http'
    else
      return 'https'

RegExp.escape = (s) ->
    return s.replace /[-\/\\^$*+?.()|[\]{}]/g, '\\$&'

exports.Url = Url

exports.crawl = (seedSite, cb) ->
  req seedSite.baseUrl, (err, res, body) ->
    if err
      return cb(err)

    re = /<a[^>]*href="([^"]*)"[^>]*>/g

    urls = []
    while (curVal = re.exec(body))?
      curUrl = curVal[1]
      normalizedUrl = urlHandler.resolve seedSite.baseUrl, curUrl

      # Do not store URLs that are just hashes of the current URL (because probably the same page)
      hashBaseUrlRegex = new RegExp RegExp.escape("#{ seedSite.baseUrl }#[^/]*$")

      # currently removes mailto links here also... but really should be in url-controller
      if not hashBaseUrlRegex.test normalizedUrl and curUrl.substr(0, 7) != 'mailto:'
        urls.push normalizedUrl

    cb null, urls
