# Platform Utils

## How to use
Install as a github npm module, and import like so:
```
const mongooseUtils = require('gc-utils/mongoose');
```
Note that each kind of utility file is a separate sub-directory of the gc-utils package.

## How to Maintain
Our systems should **always** reference the package by a particular release tag so we can manage versions appropriately:
```
// In package.json dependencies...
"platform-utils": "git://github.com/greenchef/platform-utils.git#1.3.2",
```

When making changes, recognize that you are changing a package that is used across all of our services.
Make a release tag that follows [semver standards](https://docs.npmjs.com/about-semantic-versioning).
