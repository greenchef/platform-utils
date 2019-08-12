const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');

let env = dotenv.config();
if (env.error) console.log(env.error);
env = dotenvParseVariables(env.parsed);
