#!/user/bin/env node

'use strict';

var path = require('path');
var fs = require('fs');

var ComponentFile = require('../lib/component-file');
var Component = require('../lib/component');

var component = new Component(process.argv);
