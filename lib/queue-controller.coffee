kue = require 'kue'
events = require 'events'

jobs = kue.createQueue()

class JobQueue extends events.EventEmitter
  newJob: (job, jobId, done) ->
    @emit('new-job', job, jobId, done)


exports.currentJob = currentJob = new JobQueue()

exports.createJob = (urlDetails) ->
  return new Promise (resolve, reject) ->
    if not urlDetails.title?
      return reject new Error 'Job title required.'

    if not urlDetails.url?
      return reject new Error 'URL required.'

    job = jobs.create 'url', urlDetails
    .save (err) ->
      return reject err if err

      resolve job.id


# set job queue listeners before initializing the queue
exports.initialize = () ->
  jobs.process 'url', (job, done) =>
    currentJob.newJob job.data, job.id, done


# process.once 'SIGINT', (sig) ->
#   console.log();
#   jobs.shutdown (err) ->
#     console.log('Kue is shut down.')
#     process.exit 0
# , 5000
