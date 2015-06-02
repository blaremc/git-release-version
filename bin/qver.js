#!/usr/bin/env node

var lib = require('../lib/version.js');
process.title = 'qflow';
lib.verInc(process.argv[2], process.argv[3]);