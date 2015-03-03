queue = require './lib/queue-controller'
urlChecker = require './lib/url-controller'
crawler = require './lib/crawler-controller'

processUrl = (url, parentUrl) ->
  urlChecker.crawlUrl(url)
  .then(((allowed) ->
    if allowed
      queue.createJob({
        title: url
        url: url
        parent: parentUrl
        datetime: Date.now()
        })
    ), ((err) -> console.log(err)))

crawlUrls = (jobId) ->
  console.log "job #{ jobId } added to queue"

  queue.currentJob.on 'new-job', (job, jobId, done) ->
    console.log "job: #{ job }, jobId: #{ jobId }"
    crawler.crawl new crawler.Url(job.url), (err, urls) ->
      if err
        console.log(err)

      processUrl(url, job.url) for url in urls

    done()

seedUrl = 'https://news.google.com/news/directory'

queue.createJob(
  title: seedUrl
  url: seedUrl
  datetime: Date.now()
)
.then(crawlUrls, ((err) -> console.log(err)))

queue.initialize()
