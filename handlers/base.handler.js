const logger = require('../initializers/logger');

class BaseHandler {
  constructor(topic, job) {
    this.job = job;
    this.topic = process.env.APP_CLUSTER ? `${process.env.APP_CLUSTER}-${topic}` : `local-${topic}`;
  }

  getTopic() {
    return this.topic;
  }

  getJob() {
    return this.job;
  }

  async work(data) {
    if (!this.job) {
      logger.error('work function not implemented for handler');
      throw new Error('work function not implemented for handler');
    }
  }
}

module.exports = BaseHandler;
