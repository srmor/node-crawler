queue = require './lib/queue-controller'
urlChecker = require './lib/url-controller'
crawler = require './lib/crawler-controller'

totalNumProcessed = 0

processUrl = (url, parentUrl) ->
  # urlChecker.crawlUrl(url)
  # .then(((allowed) ->
    # if allowed
      queue.createJob({
        title: url
        url: url
        parent: parentUrl
        datetime: Date.now()
        })
      x = 1
    # ), ((err) -> console.log(err)))

crawlUrls = () ->
  queue.currentJob.on 'new-job', (job, jobId, done) ->
    console.log "job: #{ job }, jobId: #{ jobId }"
    urlChecker.crawlUrl(job.url)
    .then((allowed) ->
      console.log("end #{ job.url }")
      if allowed
        crawler.crawl new crawler.Url(job.url), (err, urls) ->
          if err
            err.url = job.url
            return console.log(err)

          if totalNumProcessed == 10000
            return process.exit()

          if totalNumProcessed % 100 == 0
            console.log "processed: #{ totalNumProcessed }"

          totalNumProcessed++
          processUrl(url, job.url) for url in urls

          done()
      else
        done()
    )

seedUrl = 'https://news.google.com/news/directory'

crawlUrls()

queue.createJob(
  title: seedUrl
  url: seedUrl
  datetime: Date.now()
)


queue.initialize()

process.once 'SIGINT', () ->
  console.log(processUrl)
, 5000
