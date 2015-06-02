#!/usr/bin/env node

var lib = require('../lib/flow.js');
process.title = 'qflow';
lib.flow(process.argv[2], process.argv[3]);