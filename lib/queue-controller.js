// Generated by CoffeeScript 1.9.1
var JobQueue, currentJob, events, getNewJob, jobs, kue,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

kue = require('kue');

events = require('events');

exports.jobs = jobs = [];

JobQueue = (function(superClass) {
  extend(JobQueue, superClass);

  function JobQueue() {
    return JobQueue.__super__.constructor.apply(this, arguments);
  }

  JobQueue.prototype.newJob = function(job, jobId, done) {
    return this.emit('new-job', job, jobId, done);
  };

  return JobQueue;

})(events.EventEmitter);

exports.currentJob = currentJob = new JobQueue();

exports.createJob = function(urlDetails) {
  return jobs.push(urlDetails);
};

exports.initialize = function() {
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  getNewJob();
  return getNewJob();
};

getNewJob = function() {
  if (jobs.length > 0) {
    return currentJob.newJob(jobs.shift(), null, getNewJob);
  } else {
    return setTimeout(getNewJob, 1000);
  }
};