const additionalFormats = require('convict-format-with-validator');
const convict = require('convict');

const { email, url } = additionalFormats;

convict.addFormats(email, url);

// Invokes a function which sets a singleton to process.convict;
// Although this returns the convict config, the process.convict singleton usage
// is preferred.
module.exports = (...configs) => {
  const combinedConfigs = configs.reduce((acc, config) => ({ ...acc, ...config }), {});
  const conv = convict(combinedConfigs);
  conv.validate({ allowed: 'strict' });
  process.convict = conv;
  return conv;
}

