const { log } = require('../initializers');

class BaseHandler {
  constructor(topic, job) {
  	this.logger = log.createLogger({ group: this.constructor.name, handlerName: this.constructor.name });
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
      this.logger.error('work function not implemented for handler');
      throw new Error('work function not implemented for handler');
    }
  }
}

module.exports = BaseHandler;
