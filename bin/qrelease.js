#!/usr/bin/env node

var lib = require('../lib/release.js');
process.title = 'qrelease';
lib.verInc(process.argv[2], process.argv[3], process.argv[4]);