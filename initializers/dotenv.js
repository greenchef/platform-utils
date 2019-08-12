const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');

const env = dotenv.config();
if (env.error) console.log(env.error);
dotenvParseVariables(env.parsed);
