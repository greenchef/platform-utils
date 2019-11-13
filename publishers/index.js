module.exports = {
  models: {},

  connect() {
    Object.values(this.models).forEach((publisher) => {
      publisher.connect();
    })
  },

  getPublisher(name) {
    return this.models[name];
  },

  registerPublisher(name, Clazz) {
    if (Clazz) {
      if (this.models[name]) {
        throw new Error('would overwrite existing model');
      } else {
        const instantiatedProducer = new Clazz();
        if (Object.values(this.models).map(p => p.getTopic()).includes(instantiatedProducer.topic)) {
          throw new Error(`Duplicate Topic Registration error: cannot register "${name}", a producer is already registered to topic "${instantiatedProducer.topic}"`);
        } else {
          this.models[name] = instantiatedProducer;
        }
      }
    }
    return this.models[name];
  }
};

