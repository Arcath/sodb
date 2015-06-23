# sodb [![Build Status](https://travis-ci.org/Arcath/sodb.svg?branch=master)](https://travis-ci.org/Arcath/sodb)

Single Object Data Base

## Install

```
npm install sodb --save
```

## Usage

```javascript
sodb = require('sodb');

db = new sodb();

db.add({name: 'bob', gender: 'm'});

bob = db.findOne({name: 'bob'});
bob.gender // m
```


 - [Creating a Database](docs/creating_a_database.markdown)
 - [Finding Data](docs/finding_data.markdown)
 - [Updating and Removing Data](docs/updating_and_removing_data.markdown)
 - [Caching](docs/caching.markdown)

## Contributing

Feel free to fork this repo and submit changes!

Run `npm install` to install all the modules. Once that finishes run `grunt test` to run the tests and `grunt testDocs` to test that the code examples in the docs work.

Please add/amend the documentation to reflect your changes and add any code you put into the documentation to `tests/doc-tests.js`.

When you fork sodb please:

1. Create your feature branch (`git checkout -b my-new-feature`)
2. Commit your changes (`git commit -am 'Add some feature'`)
3. Push to the branch (`git push origin my-new-feature`)
4. Create new Pull Request
